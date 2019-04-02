import Vue from 'vue';
import Router from 'vue-router';

import store from './store/index';

import Login from './pages/login.vue';
import Panel from './pages/panel/panel.vue';

Vue.use(Router);

/**
 * @type {import('vue-router').RouteConfig[]}
 */
const routes = [
  {
    path: '/',
    title: 'S Dashboard Web Console',
    redirect: { name: 'login' },
  },
  {
    path: '/login',
    title: '登录',
    name: 'login',
    component: Login
  },
  {
    path: '/panel',
    title: '控制台',
    name: 'panel',
    component: Panel,
    beforeEnter(to, from, next) {
      const { token, due } = store.state.user;
      if (token && due > Date.now()) {
        next();
      } else {
        next({ name: 'login' });
      }
    }
  }
];

export default new Router({
  routes
});
