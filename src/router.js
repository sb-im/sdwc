import Vue from 'vue';
import Router from 'vue-router';

import store from './store/index';

import Login from './pages/login.vue';
import Panel from './pages/panel/panel.vue';
import Plan from './pages/plan/plan.vue';
import PlanNew from './pages/plan/new.vue';
import PlanEdit from './pages/plan/edit.vue';
import PlanView from './pages/plan/view.vue';
import Node from './pages/node/node.vue';

Vue.use(Router);

function checkUser() {
  const { token, due } = store.state.user;
  if (token && due > Date.now()) return true;
  return false;
}

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
    path: '/panel',
    name: 'panel',
    component: Panel,
    beforeEnter(to, from, next) {
      next(checkUser() ? undefined : '/login');
    },
    children: [
      {
        path: 'node/:id',
        name: 'node',
        component: Node,
        props: route => ({ id: Number.parseInt(route.params.id, 10) })
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
        props: route => ({ id: Number.parseInt(route.params.id, 10) }),
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
  }
];

export default new Router({
  routes
});
