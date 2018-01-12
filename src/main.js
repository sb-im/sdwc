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
      server: "",
      token: ""
    },
    count: 0
  },
  mutations: {
    config (state, config) {
      state.config.server = config.server
    },
    token (state, config) {
      state.config.token = config.token
    },
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

