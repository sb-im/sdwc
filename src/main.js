import Vue from 'vue'
import axios from 'axios'
Vue.prototype.$http = axios
import VueJsonp from 'vue-jsonp'
Vue.use(VueJsonp)
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
Vue.use(ElementUI)

import App from './App.vue'
import store from "./config/store.js"
import router from "./config/router.js"
import i18n from './lang/index.js'
import './assets/css/base.css'

new Vue({
  el: '#app',
  store,
  i18n,
  router,
  render: c => c(App)
});

