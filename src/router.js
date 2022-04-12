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
import Iframe from './pages/iframe.vue';

Vue.use(Router);

const int = s => Number.parseInt(s, 10);

const camelizeRE = /-(\w)/g;
const camelize = (/** @type {string} */ str) => {
  return str.replace(camelizeRE, (_, c) => c ? c.toUpperCase() : '');
};

/**
 * @type {import('vue-router').RouteConfig[]}
 */
const routes = [
  {
    path: '/',
    name: 'root'
  },
  {
    path: '/login',
    name: 'login',
    component: Login
  },
  {
    path: '/login/:username/:password',
    name: 'login-api',
    component: Login
  },
  {
    path: '/login/:username/:password/:path',
    name: 'login-api-path',
    component: Login
  },
  {
    path: '/panel',
    name: 'panel',
    component: Panel,
    redirect: { name: 'overview' },
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
        props: route => ({ id: route.params.id })
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
      },
      {
        path: 'iframe/:index',
        name: 'iframe',
        component: Iframe,
        props: route => ({
          src: store.state.ui.sidebar[int(route.params.index)].args
        })
      }
    ]
  },
  {
    path: '/embedded/:node/:point',
    name: 'embedded',
    component: Embedded,
    meta: {
      suppressNotify: true
    },
    props(route) {
      const { node, point } = route.params;
      const props = { node, point };
      for (const key in route.query) {
        props[camelize(key)] = route.query[key];
      }
      return props;
    }
  }
];

const router = new Router({
  routes
});

router.beforeEach((to, from, next) => {
  const auth = store.getters.authenticated;
  switch (to.name) {
    case 'root':
      next(auth ? '/panel' : '/login');
      break;
    case 'login':
    case 'login-api':
    case 'login-api-path': {
      let { path = '' } = to.params;
      if (path[0] !== '/') {
        path = '/' + path;
      }
      next(auth ? { path, query: to.query } : undefined);
      break;
    }
    default: {
      if (auth) {
        next();
        break;
      }
      next({ name: 'login', query: { redir: to.fullPath } });
      break;
    }
  }
});

export default router;
