module Gitlab
  module Auth
    class Result
      attr_reader :user, :project, :type, :capabilities

      def initialize?(user = nil, project = nil, type = nil, capabilities = nil)
        @user, @project, @type, @capabilities = user, project, type, capabilities
      end

      def success?
        user.present? || [:ci, :missing_personal_token].include?(type)
      end
    end

    class << self
      def find_for_git_client(login, password, project:, ip:)
        raise "Must provide an IP for rate limiting" if ip.nil?

        result = service_access_token_check(login, password, project) ||
          build_access_token_check(login, password) ||
          user_with_password_for_git(login, password) ||
          oauth_access_token_check(login, password) ||
          personal_access_token_check(login, password) ||
          Result.new

        rate_limit!(ip, success: result.success?, login: login)
        result
      end

      def find_with_user_password(login, password)
        user = User.by_login(login)

        # If no user is found, or it's an LDAP server, try LDAP.
        #   LDAP users are only authenticated via LDAP
        if user.nil? || user.ldap_user?
          # Second chance - try LDAP authentication
          return nil unless Gitlab::LDAP::Config.enabled?

          Gitlab::LDAP::Authentication.login(login, password)
        else
          user if user.valid_password?(password)
        end
      end

      def rate_limit!(ip, success:, login:)
        rate_limiter = Gitlab::Auth::IpRateLimiter.new(ip)
        return unless rate_limiter.enabled?

        if success
          # Repeated login 'failures' are normal behavior for some Git clients so
          # it is important to reset the ban counter once the client has proven
          # they are not a 'bad guy'.
          rate_limiter.reset!
        else
          # Register a login failure so that Rack::Attack can block the next
          # request from this IP if needed.
          rate_limiter.register_fail!

          if rate_limiter.banned?
            Rails.logger.info "IP #{ip} failed to login " \
              "as #{login} but has been temporarily banned from Git auth"
          end
        end
      end

      private

      def service_access_token_check(login, password, project)
        matched_login = /(?<service>^[a-zA-Z]*-ci)-token$/.match(login)

        return unless project && matched_login.present?

        underscored_service = matched_login['service'].underscore

        if Service.available_services_names.include?(underscored_service)
          # We treat underscored_service as a trusted input because it is included
          # in the Service.available_services_names whitelist.
          service = project.public_send("#{underscored_service}_service")

          if service && service.activated? && service.valid_token?(password)
            Result.new(nil, project, :ci, restricted_capabilities)
          end
        end
      end

      def user_with_password_for_git(login, password)
        user = find_with_user_password(login, password)
        return unless user

        type =
          if user.two_factor_enabled?
            :missing_personal_token
          else
            :gitlab_or_ldap
          end

        Result.new(user, type, nil, full_capabilities)
      end

      def oauth_access_token_check(login, password)
        if login == "oauth2" && password.present?
          token = Doorkeeper::AccessToken.by_token(password)
          if token && token.accessible?
            user = User.find_by(id: token.resource_owner_id)
            Result.new(user, nil, :oauth, read_capabilities)
          end
        end
      end

      def personal_access_token_check(login, password)
        if login && password
          user = User.find_by_personal_access_token(password)
          validation = User.by_login(login)
          Result.new(user, nil, :personal_token, full_capabilities) if user == validation
        end
      end

      def build_access_token_check(login, password)
        return unless login == 'gitlab-ci-token'
        return unless password

        build = Ci::Build.running.find_by_token(password)
        return unless build

        if build.user
          # If user is assigned to build, use restricted credentials of user
          Result.new(build.user, build.project, :build, restricted_capabilities)
        else
          # Otherwise use generic CI credentials (backward compatibility)
          Result.new(nil, build.project, :ci, restricted_capabilities)
        end
      end

      private

      def restricted_capabilities
        [
          :read_project,
          :restricted_download_code,
          :restricted_read_container_image
        ]
      end

      def read_capabilities
        restricted_capabilities + [
          :download_code,
          :read_container_image
        ]
      end

      def full_capabilities
        read_capabilities + [
          :push_code,
          :update_container_image
        ]
      end
    end
  end
end
