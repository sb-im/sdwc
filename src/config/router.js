import Vue from 'vue'
import Router from 'vue-router'
import Login from '../pages/login'
import Index from '../pages/index'

Vue.use(Router);

export default new Router({
  routes: [
    {path: '/', title:'登录', redirect: { name: 'login' }},
    {path: '/login', title:'登录', name:'login', component: Login},
    {path: '/app', title:'首页', name:'index', component: Index}
  ]
});
