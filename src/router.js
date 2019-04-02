import Vue from 'vue';
import Router from 'vue-router';

import Login from './pages/login.vue';
import Index from './pages/index.vue';

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
    path: '/app',
    title: '首页',
    name: 'index',
    component: Index
  }
];

export default new Router({
  routes
});
