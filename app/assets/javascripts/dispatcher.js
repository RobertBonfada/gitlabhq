/* eslint-disable func-names, space-before-function-paren, no-var, prefer-arrow-callback, wrap-iife, no-shadow, consistent-return, one-var, one-var-declaration-per-line, camelcase, default-case, no-new, quotes, no-duplicate-case, no-case-declarations, no-fallthrough, max-len */
import projectSelect from './project_select';
import Milestone from './milestone';
import IssuableForm from './issuable_form';
import LabelsSelect from './labels_select';
import MilestoneSelect from './milestone_select';
import NotificationsForm from './notifications_form';
import notificationsDropdown from './notifications_dropdown';
import groupAvatar from './group_avatar';
import GroupLabelSubscription from './group_label_subscription';
import LineHighlighter from './line_highlighter';
import Project from './project';
import projectAvatar from './project_avatar';
import MergeRequest from './merge_request';
import Compare from './compare';
import ProjectNew from './project_new';
import Labels from './labels';
import LabelManager from './label_manager';
import Sidebar from './right_sidebar';
import IssuableTemplateSelectors from './templates/issuable_template_selectors';
import Flash from './flash';
import BindInOut from './behaviors/bind_in_out';
import SecretValues from './behaviors/secret_values';
import Group from './group';
import ProjectsList from './projects_list';
import UserCallout from './user_callout';
import ShortcutsWiki from './shortcuts_wiki';
import BlobViewer from './blob/viewer/index';
import UsersSelect from './users_select';
import GfmAutoComplete from './gfm_auto_complete';
import Star from './star';
import TreeView from './tree';
import Wikis from './wikis';
import ZenMode from './zen_mode';
import initSettingsPanels from './settings_panels';
import PerformanceBar from './performance_bar';
import initNotes from './init_notes';
import initIssuableSidebar from './init_issuable_sidebar';
import initProjectVisibilitySelector from './project_visibility';
import NewGroupChild from './groups/new_group_child';
import { ajaxGet, convertPermissionToBoolean } from './lib/utils/common_utils';
import GlFieldErrors from './gl_field_errors';
import GLForm from './gl_form';
import Shortcuts from './shortcuts';
import ShortcutsNavigation from './shortcuts_navigation';
import ShortcutsIssuable from './shortcuts_issuable';
import U2FAuthenticate from './u2f/authenticate';
import Members from './members';
import memberExpirationDate from './member_expiration_date';
import Diff from './diff';
import ProjectLabelSubscription from './project_label_subscription';
import SearchAutocomplete from './search_autocomplete';
import Activities from './activities';

(function() {
  var Dispatcher;

  Dispatcher = (function() {
    function Dispatcher() {
      this.initSearch();
      this.initFieldErrors();
      this.initPageScripts();
    }

    Dispatcher.prototype.initPageScripts = function() {
      var path, shortcut_handler;
      const page = $('body').attr('data-page');
      if (!page) {
        return false;
      }

      const fail = () => Flash('Error loading dynamic module');
      const callDefault = m => m.default();

      path = page.split(':');
      shortcut_handler = null;

      $('.js-gfm-input:not(.js-vue-textarea)').each((i, el) => {
        const gfm = new GfmAutoComplete(gl.GfmAutoComplete && gl.GfmAutoComplete.dataSources);
        const enableGFM = convertPermissionToBoolean(el.dataset.supportsAutocomplete);
        gfm.setup($(el), {
          emojis: true,
          members: enableGFM,
          issues: enableGFM,
          milestones: enableGFM,
          mergeRequests: enableGFM,
          labels: enableGFM,
        });
      });

      const filteredSearchEnabled = gl.FilteredSearchManager && document.querySelector('.filtered-search');

      switch (page) {
        case 'sessions:new':
          import('./pages/sessions/new')
            .then(callDefault)
            .catch(fail);
          break;
        case 'projects:boards:show':
        case 'projects:boards:index':
          import('./pages/projects/boards/index')
            .then(callDefault)
            .catch(fail);
          shortcut_handler = true;
          break;
        case 'projects:merge_requests:index':
          import('./pages/projects/merge_requests/index')
            .then(callDefault)
            .catch(fail);
          shortcut_handler = true;
          break;
        case 'projects:issues:index':
          import('./pages/projects/issues/index')
            .then(callDefault)
            .catch(fail);
          shortcut_handler = true;
          break;
        case 'projects:issues:show':
          import('./pages/projects/issues/show')
            .then(callDefault)
            .catch(fail);
          shortcut_handler = true;
          break;
        case 'dashboard:milestones:index':
          import('./pages/dashboard/milestones/index')
            .then(callDefault)
            .catch(fail);
          break;
        case 'projects:milestones:show':
        case 'groups:milestones:show':
          new Milestone();
          new Sidebar();
          break;
        case 'dashboard:milestones:show':
          import('./pages/dashboard/milestones/show')
            .then(callDefault)
            .catch(fail);
          break;
        case 'dashboard:issues':
          import('./pages/dashboard/issues')
            .then(callDefault)
            .catch(fail);
          break;
        case 'dashboard:merge_requests':
          import('./pages/dashboard/merge_requests')
            .then(callDefault)
            .catch(fail);
          break;
        case 'groups:issues':
        case 'groups:merge_requests':
          if (filteredSearchEnabled) {
            const filteredSearchManager = new gl.FilteredSearchManager(page === 'groups:issues' ? 'issues' : 'merge_requests');
            filteredSearchManager.setup();
          }
          projectSelect();
          break;
        case 'dashboard:todos:index':
          import('./pages/dashboard/todos/index').then(callDefault).catch(fail);
          break;
        case 'admin:jobs:index':
          import('./pages/admin/jobs/index')
            .then(callDefault)
            .catch(fail);
          break;
        case 'dashboard:projects:index':
        case 'dashboard:projects:starred':
          import('./pages/dashboard/projects')
            .then(callDefault)
            .catch(fail);
          break;
        case 'explore:projects:index':
        case 'explore:projects:trending':
        case 'explore:projects:starred':
          import('./pages/explore/projects')
            .then(callDefault)
            .catch(fail);
          break;
        case 'explore:groups:index':
          import('./pages/explore/groups')
            .then(callDefault)
            .catch(fail);
          break;
        case 'projects:milestones:new':
        case 'projects:milestones:create':
          import('./pages/projects/milestones/new')
            .then(callDefault)
            .catch(fail);
          break;
        case 'projects:milestones:edit':
        case 'projects:milestones:update':
          import('./pages/projects/milestones/edit')
            .then(callDefault)
            .catch(fail);
          break;
        case 'groups:milestones:new':
        case 'groups:milestones:create':
          import('./pages/groups/milestones/new')
            .then(callDefault)
            .catch(fail);
          break;
        case 'groups:milestones:edit':
        case 'groups:milestones:update':
          import('./pages/groups/milestones/edit')
            .then(callDefault)
            .catch(fail);
          break;
        case 'projects:compare:show':
          import('./pages/projects/compare/show')
            .then(callDefault)
            .catch(fail);
          break;
        case 'projects:branches:new':
          import('./pages/projects/branches/new')
            .then(callDefault)
            .catch(fail);
          break;
        case 'projects:branches:create':
          import('./pages/projects/branches/new')
            .then(callDefault)
            .catch(fail);
          break;
        case 'projects:branches:index':
          import('./pages/projects/branches/index')
            .then(callDefault)
            .catch(fail);
          break;
        case 'projects:issues:new':
          import('./pages/projects/issues/new')
            .then(callDefault)
            .catch(fail);
          shortcut_handler = true;
          break;
        case 'projects:issues:edit':
          import('./pages/projects/issues/edit')
            .then(callDefault)
            .catch(fail);
          shortcut_handler = true;
          break;
        case 'projects:merge_requests:creations:new':
          const mrNewCompareNode = document.querySelector('.js-merge-request-new-compare');
          if (mrNewCompareNode) {
            new Compare({
              targetProjectUrl: mrNewCompareNode.dataset.targetProjectUrl,
              sourceBranchUrl: mrNewCompareNode.dataset.sourceBranchUrl,
              targetBranchUrl: mrNewCompareNode.dataset.targetBranchUrl,
            });
          } else {
            const mrNewSubmitNode = document.querySelector('.js-merge-request-new-submit');
            new MergeRequest({
              action: mrNewSubmitNode.dataset.mrSubmitAction,
            });
          }
        case 'projects:merge_requests:creations:diffs':
        case 'projects:merge_requests:edit':
          new Diff();
          shortcut_handler = new ShortcutsNavigation();
          new GLForm($('.merge-request-form'), true);
          new IssuableForm($('.merge-request-form'));
          new LabelsSelect();
          new MilestoneSelect();
          new IssuableTemplateSelectors();
          break;
        case 'projects:tags:new':
          import('./pages/projects/tags/new')
            .then(callDefault)
            .catch(fail);
          break;
        case 'projects:snippets:show':
          initNotes();
          new ZenMode();
          break;
        case 'projects:snippets:new':
        case 'projects:snippets:edit':
        case 'projects:snippets:create':
        case 'projects:snippets:update':
          new GLForm($('.snippet-form'), true);
          new ZenMode();
          break;
        case 'snippets:new':
          import('./pages/snippets/new')
            .then(callDefault)
            .catch(fail);
          break;
        case 'snippets:edit':
          import('./pages/snippets/edit')
            .then(callDefault)
            .catch(fail);
          break;
        case 'snippets:create':
          import('./pages/snippets/new')
            .then(callDefault)
            .catch(fail);
          break;
        case 'snippets:update':
          import('./pages/snippets/edit')
            .then(callDefault)
            .catch(fail);
          break;
        case 'projects:releases:edit':
          new ZenMode();
          new GLForm($('.release-form'), true);
          break;
        case 'projects:merge_requests:show':
          new Diff();
          new ZenMode();

          initIssuableSidebar();
          initNotes();

          const mrShowNode = document.querySelector('.merge-request');
          window.mergeRequest = new MergeRequest({
            action: mrShowNode.dataset.mrAction,
          });

          shortcut_handler = new ShortcutsIssuable(true);
          break;
        case 'dashboard:activity':
          import('./pages/dashboard/activity')
            .then(callDefault)
            .catch(fail);
          break;
        case 'projects:commit:show':
          import('./pages/projects/commit/show')
            .then(callDefault)
            .catch(fail);
          shortcut_handler = true;
          break;
        case 'projects:commit:pipelines':
          import('./pages/projects/commit/pipelines')
            .then(callDefault)
            .catch(fail);
          break;
        case 'projects:activity':
          import('./pages/projects/activity')
            .then(callDefault)
            .catch(fail);
          shortcut_handler = true;
          break;
        case 'projects:commits:show':
          import('./pages/projects/commits/show')
            .then(callDefault)
            .catch(fail);
          shortcut_handler = true;
          break;
        case 'projects:show':
          shortcut_handler = new ShortcutsNavigation();
          new NotificationsForm();
          new UserCallout({
            setCalloutPerProject: true,
            className: 'js-autodevops-banner',
          });

          if ($('#tree-slider').length) new TreeView();
          if ($('.blob-viewer').length) new BlobViewer();
          if ($('.project-show-activity').length) new Activities();
          $('#tree-slider').waitForImages(function() {
            ajaxGet(document.querySelector('.js-tree-content').dataset.logsPath);
          });
          break;
        case 'projects:edit':
          import('./pages/projects/edit')
            .then(callDefault)
            .catch(fail);
          break;
        case 'projects:imports:show':
          import('./pages/projects/imports/show')
            .then(callDefault)
            .catch(fail);
          break;
        case 'projects:pipelines:new':
        case 'projects:pipelines:create':
          import('./pages/projects/pipelines/new')
            .then(callDefault)
            .catch(fail);
          break;
        case 'projects:pipelines:builds':
        case 'projects:pipelines:failures':
        case 'projects:pipelines:show':
          import('./pages/projects/pipelines/builds')
            .then(callDefault)
            .catch(fail);
          break;
        case 'groups:activity':
          new Activities();
          break;
        case 'groups:show':
          const newGroupChildWrapper = document.querySelector('.js-new-project-subgroup');
          shortcut_handler = new ShortcutsNavigation();
          new NotificationsForm();
          notificationsDropdown();
          new ProjectsList();

          if (newGroupChildWrapper) {
            new NewGroupChild(newGroupChildWrapper);
          }
          break;
        case 'groups:group_members:index':
          memberExpirationDate();
          new Members();
          new UsersSelect();
          break;
        case 'projects:project_members:index':
          import('./pages/projects/project_members/')
            .then(callDefault)
            .catch(fail);
          break;
        case 'groups:new':
        case 'groups:create':
          BindInOut.initAll();
          new Group();
          groupAvatar();
          break;
        case 'admin:groups:create':
        case 'admin:groups:new':
          import('./pages/admin/groups/new')
            .then(callDefault)
            .catch(fail);
          break;
        case 'admin:groups:edit':
          import('./pages/admin/groups/edit')
            .then(callDefault)
            .catch(fail);
          break;
        case 'groups:edit':
          groupAvatar();
          break;
        case 'projects:tree:show':
          import('./pages/projects/tree/show')
            .then(callDefault)
            .catch(fail);
          shortcut_handler = true;
          break;
        case 'projects:find_file:show':
          import('./pages/projects/find_file/show')
            .then(callDefault)
            .catch(fail);
          shortcut_handler = true;
          break;
        case 'projects:blob:show':
          import('./pages/projects/blob/show')
            .then(callDefault)
            .catch(fail);
          shortcut_handler = true;
          break;
        case 'projects:blame:show':
          import('./pages/projects/blame/show')
            .then(callDefault)
            .catch(fail);
          shortcut_handler = true;
          break;
        case 'groups:labels:new':
        case 'groups:labels:edit':
          new Labels();
          break;
        case 'projects:labels:new':
          import('./pages/projects/labels/new')
            .then(callDefault)
            .catch(fail);
          break;
        case 'projects:labels:edit':
          import('./pages/projects/labels/edit')
            .then(callDefault)
            .catch(fail);
          break;
        case 'projects:labels:index':
          import('./pages/projects/labels/index')
            .then(callDefault)
            .catch(fail);
          break;
        case 'groups:labels:index':
          if ($('.prioritized-labels').length) {
            new LabelManager();
          }
          $('.label-subscription').each((i, el) => {
            const $el = $(el);

            if ($el.find('.dropdown-group-label').length) {
              new GroupLabelSubscription($el);
            } else {
              new ProjectLabelSubscription($el);
            }
          });
          break;
        case 'projects:network:show':
          // Ensure we don't create a particular shortcut handler here. This is
          // already created, where the network graph is created.
          shortcut_handler = true;
          break;
        case 'projects:forks:new':
          import('./pages/projects/forks/new')
            .then(callDefault)
            .catch(fail);
          break;
        case 'projects:artifacts:browse':
          import('./pages/projects/artifacts/browse')
            .then(callDefault)
            .catch(fail);
          shortcut_handler = true;
          break;
        case 'projects:artifacts:file':
          import('./pages/projects/artifacts/file')
            .then(callDefault)
            .catch(fail);
          shortcut_handler = true;
          break;
        case 'help:index':
          import('./pages/help')
            .then(callDefault)
            .catch(fail);
          break;
        case 'search:show':
          import('./pages/search/show')
            .then(callDefault)
            .catch(fail);
          break;
        case 'projects:settings:repository:show':
          // Initialize expandable settings panels
          initSettingsPanels();
          break;
        case 'projects:settings:ci_cd:show':
          // Initialize expandable settings panels
          initSettingsPanels();

          const runnerToken = document.querySelector('.js-secret-runner-token');
          if (runnerToken) {
            const runnerTokenSecretValue = new SecretValues(runnerToken);
            runnerTokenSecretValue.init();
          }
        case 'groups:settings:ci_cd:show':
          const secretVariableTable = document.querySelector('.js-secret-variable-table');
          if (secretVariableTable) {
            const secretVariableTableValues = new SecretValues(secretVariableTable);
            secretVariableTableValues.init();
          }
          break;
        case 'ci:lints:create':
        case 'ci:lints:show':
          import('./pages/ci/lints').then(m => m.default()).catch(fail);
          break;
        case 'users:show':
          import('./pages/users/show').then(callDefault).catch(fail);
          break;
        case 'admin:conversational_development_index:show':
          import('./pages/admin/conversational_development_index/show').then(m => m.default()).catch(fail);
          break;
        case 'snippets:show':
          import('./pages/snippets/show')
            .then(callDefault)
            .catch(fail);
          break;
        case 'import:fogbugz:new_user_map':
          import('./pages/import/fogbugz/new_user_map').then(m => m.default()).catch(fail);
          break;
        case 'profiles:personal_access_tokens:index':
          import('./pages/profiles/personal_access_tokens')
            .then(callDefault)
            .catch(fail);
          break;
        case 'admin:impersonation_tokens:index':
          import('./pages/admin/impersonation_tokens')
            .then(callDefault)
            .catch(fail);
          break;
        case 'projects:clusters:show':
        case 'projects:clusters:update':
        case 'projects:clusters:destroy':
          import('./pages/projects/clusters/show')
            .then(callDefault)
            .catch(fail);
          break;
        case 'projects:clusters:index':
          import('./pages/projects/clusters/index')
            .then(callDefault)
            .catch(fail);
          break;
      }
      switch (path[0]) {
        case 'sessions':
        case 'omniauth_callbacks':
          if (!gon.u2f) break;
          const u2fAuthenticate = new U2FAuthenticate(
            $('#js-authenticate-u2f'),
            '#js-login-u2f-form',
            gon.u2f,
            document.querySelector('#js-login-2fa-device'),
            document.querySelector('.js-2fa-form'),
          );
          u2fAuthenticate.start();
          // needed in rspec
          gl.u2fAuthenticate = u2fAuthenticate;
        case 'admin':
          import('./pages/admin')
            .then(callDefault)
            .catch(fail);
          switch (path[1]) {
            case 'broadcast_messages':
              import('./pages/admin/broadcast_messages')
                .then(callDefault)
                .catch(fail);
              break;
            case 'cohorts':
              import('./pages/admin/cohorts')
                .then(callDefault)
                .catch(fail);
              break;
            case 'groups':
              switch (path[2]) {
                case 'show':
                  import('./pages/admin/groups/show')
                    .then(callDefault)
                    .catch(fail);
                  break;
              }
              break;
            case 'projects':
              import('./pages/admin/projects')
                .then(callDefault)
                .catch(fail);
              break;
            case 'labels':
              switch (path[2]) {
                case 'new':
                  import('./pages/admin/labels/new')
                    .then(callDefault)
                    .catch(fail);
                  break;
                case 'edit':
                  import('./pages/admin/labels/edit')
                    .then(callDefault)
                    .catch(fail);
                  break;
              }
            case 'abuse_reports':
              import('./pages/admin/abuse_reports')
                .then(callDefault)
                .catch(fail);
              break;
          }
          break;
        case 'dashboard':
        case 'root':
          new UserCallout();
          break;
        case 'profiles':
          import('./pages/profiles/index/')
            .then(callDefault)
            .catch(fail);
          break;
        case 'projects':
          new Project();
          projectAvatar();
          switch (path[1]) {
            case 'compare':
              import('./pages/projects/compare')
                .then(callDefault)
                .catch(fail);
              break;
            case 'edit':
              shortcut_handler = new ShortcutsNavigation();
              new ProjectNew();
              import(/* webpackChunkName: 'project_permissions' */ './projects/permissions')
                .then(callDefault)
                .catch(fail);
              break;
            case 'new':
              new ProjectNew();
              initProjectVisibilitySelector();
              break;
            case 'show':
              new Star();
              new ProjectNew();
              notificationsDropdown();
              break;
            case 'wikis':
              new Wikis();
              shortcut_handler = new ShortcutsWiki();
              new ZenMode();
              new GLForm($('.wiki-form'), true);
              break;
            case 'snippets':
              shortcut_handler = new ShortcutsNavigation();
              if (path[2] === 'show') {
                new ZenMode();
                new LineHighlighter();
                new BlobViewer();
              }
              break;
            case 'labels':
            case 'graphs':
            case 'compare':
            case 'pipelines':
            case 'forks':
            case 'milestones':
            case 'project_members':
            case 'deploy_keys':
            case 'builds':
            case 'hooks':
            case 'services':
            case 'protected_branches':
              shortcut_handler = new ShortcutsNavigation();
          }
          break;
      }
      // If we haven't installed a custom shortcut handler, install the default one
      if (!shortcut_handler) {
        new Shortcuts();
      }

      if (document.querySelector('#peek')) {
        new PerformanceBar({ container: '#peek' });
      }
    };

    Dispatcher.prototype.initSearch = function() {
      // Only when search form is present
      if ($('.search').length) {
        return new SearchAutocomplete();
      }
    };

    Dispatcher.prototype.initFieldErrors = function() {
      $('.gl-show-field-errors').each((i, form) => {
        new GlFieldErrors(form);
      });
    };

    return Dispatcher;
  })();

  $(window).on('load', function() {
    new Dispatcher();
  });
}).call(window);
