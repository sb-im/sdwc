import Vue from 'vue';
import Router from 'vue-router';

import store from './store/index';

import Login from './pages/login.vue';
import Panel from './pages/panel/panel.vue';

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
    }
  }
];

export default new Router({
  routes
});
