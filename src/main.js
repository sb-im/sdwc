import Vue from 'vue'

import axios from 'axios'
Vue.prototype.$http = axios

import VueRouter from 'vue-router'
Vue.use(VueRouter)

import Vuex from 'vuex'
Vue.use(Vuex)

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

import App from './App.vue'

import Login from './page/login.vue'
import routes from "./routes.js"

Vue.component('my-component', Login)

Vue.use(ElementUI)

const router =  new VueRouter({
    routes
})

const store = new Vuex.Store({
  state: {
    config: {
      token: ""
    },
    count: 0
  },
  mutations: {
    increment (state) {
      state.count++
    }
  }
})


new Vue({
  el: '#app',
  store,
  router,
  render: h => h(App)
})

