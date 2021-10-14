import Vue from 'vue';
import Router from 'vue-router';

import store from './store/index';

import Login from './pages/login.vue';
import Panel from './pages/panel/panel.vue';
import Overview from './pages/overview/overview.vue';
import Plan from './pages/plan/plan.vue';
import PlanNew from './pages/plan/new.vue';
import PlanEdit from './pages/plan/edit.vue';
import PlanView from './pages/plan/view.vue';
import Node from './pages/node/node.vue';
import Embedded from './pages/embedded.vue';

Vue.use(Router);

function checkUser() {
  const { token, due } = store.state.user;
  if (token && due > Date.now()) return true;
  return false;
}

const int = s => Number.parseInt(s, 10);

/**
 * @type {import('vue-router').RouteConfig[]}
 */
const routes = [
  {
    path: '/',
    redirect: () => checkUser() ? '/panel' : '/login'
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
    beforeEnter(to, from, next) {
      next(checkUser() ? '/panel' : undefined);
    }
  },
  {
    path: '/login/:username/:password',
    name: 'login-api',
    component: Login,
    beforeEnter(to, from, next) {
      next(checkUser() ? '/panel' : undefined);
    }
  },
  {
    path: '/login/:username/:password/:path',
    name: 'login-api-path',
    component: Login,
    beforeEnter(to, from, next) {
      let path = to.params.path;
      if (path.length > 0 && path[0] !== '/') {
        path = '/' + path;
      }
      next(checkUser() ? ({ path, query: to.query } || '/panel') : undefined);
    }
  },
  {
    path: '/panel',
    name: 'panel',
    component: Panel,
    redirect: { name: 'overview' },
    beforeEnter(to, from, next) {
      next(checkUser() ? undefined : '/login');
    },
    children: [
      {
        path: 'overview',
        name: 'overview',
        component: Overview
      },
      {
        path: 'node/:id',
        name: 'node',
        component: Node,
        props: route => ({ id: int(route.params.id) })
      },
      {
        path: 'plan/new',
        name: 'plan/new',
        component: PlanNew
      },
      {
        path: 'plan/:id',
        name: 'plan',
        component: Plan,
        redirect: { name: 'plan/view' },
        props: route => ({ id: int(route.params.id) }),
        children: [
          {
            path: 'edit',
            name: 'plan/edit',
            component: PlanEdit
          },
          {
            path: 'view',
            name: 'plan/view',
            component: PlanView
          }
        ]
      }
    ]
  },
  {
    path: '/embedded/:node/:point',
    name: 'embedded',
    component: Embedded,
    props(route) {
      const { node, point } = route.params;
      const { header = '' } = route.query;
      return { node: int(node), point, header };
    },
    beforeEnter(to, from, next) {
      next(checkUser() ? undefined : '/login');
    },
  }
];

export default new Router({
  routes
});
