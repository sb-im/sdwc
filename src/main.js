import Vue from 'vue'
import axios from 'axios'
Vue.prototype.$http = axios.create();
import VueJsonp from 'vue-jsonp'
Vue.use(VueJsonp)
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
Vue.use(ElementUI)

import App from './App.vue'
import store from "./config/store.js"
import router from "./config/router.js"
import i18n from './lang/index.js'
// 引入全局公共样式
import './assets/css/base.css'
// 引入全局公共工具函数
import Utils from './config/utils'
Vue.prototype.$utils = Utils

new Vue({
  el: '#app',
  store,
  i18n,
  router,
  render: c => c(App)
});
