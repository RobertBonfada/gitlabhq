import Vue from 'vue';
import VueRouter from 'vue-router';
import store from './stores';
import flash from '../flash';
import {
  getTreeEntry,
} from './stores/utils';

Vue.use(VueRouter);

/**
 * Routes below /-/ide/:

/project/h5bp/html5-boilerplate/blob/master
/project/h5bp/html5-boilerplate/blob/master/app/js/test.js

/project/h5bp/html5-boilerplate/mr/123
/project/h5bp/html5-boilerplate/mr/123/app/js/test.js

/workspace/123
/workspace/project/h5bp/html5-boilerplate/blob/my-special-branch
/workspace/project/h5bp/html5-boilerplate/mr/123

/ = /workspace

/settings
*/

// Unfortunately Vue Router doesn't work without at least a fake component
// If you do only data handling
const EmptyRouterComponent = {
  render(createElement) {
    return createElement('div');
  },
};

const router = new VueRouter({
  mode: 'history',
  base: `${gon.relative_url_root}/-/ide/`,
  routes: [
    {
      path: '/project/:namespace/:project',
      component: EmptyRouterComponent,
      children: [
        {
          path: ':targetmode/:branch/*',
          component: EmptyRouterComponent,
        },
        {
          path: 'mr/:mrid',
          component: EmptyRouterComponent,
        },
      ],
    },
  ],
});

router.beforeEach((to, from, next) => {
  if (to.params.namespace && to.params.project) {
    store.dispatch('getProjectData', {
      namespace: to.params.namespace,
      projectId: to.params.project,
    })
    .then(() => {
      const fullProjectId = `${to.params.namespace}/${to.params.project}`;

      if (to.params.branch) {
        store.dispatch('getBranchData', {
          projectId: fullProjectId,
          branchId: to.params.branch,
        });

        store.dispatch('getTreeData', {
          projectId: fullProjectId,
          branch: to.params.branch,
          endpoint: `/tree/${to.params.branch}`,
        })
        .then(() => {
          if (to.params[0]) {
            const treeEntry = getTreeEntry(store, `${to.params.namespace}/${to.params.project}/${to.params.branch}`, to.params[0]);
            if (treeEntry) {
              store.dispatch('handleTreeEntryAction', treeEntry);
            }
          }
        })
        .catch((e) => {
          flash('Error while loading the branch files. Please try again.');
          throw e;
        });
      }
    })
    .catch((e) => {
      flash('Error while loading the project data. Please try again.');
      throw e;
    });
  }

  next();
});

export default router;
