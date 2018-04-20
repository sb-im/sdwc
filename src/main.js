import Vue from 'vue'

import axios from 'axios'
Vue.prototype.$http = axios

import VueRouter from 'vue-router'
Vue.use(VueRouter)

import Vuex from 'vuex'
Vue.use(Vuex)

import VueI18n from 'vue-i18n'
Vue.use(VueI18n)

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
Vue.use(ElementUI)

import VueJsonp from 'vue-jsonp'
Vue.use(VueJsonp)

import App from './App.vue'

import routes from "./routes.js"
import Config from "./config.json"

import Api from "./API.js"
//Vue.component('my-component', Login)


const router =  new VueRouter({
    routes
})

const i18n = new VueI18n({
    locale: 'en',  // Change Language
    messages: {
        'zh': require('./lang/zh'),
        'en': require('./lang/en')
    }
})


const store = new Vuex.Store({
  state: {
    api: Api,
    config: Config,
    token: "",
    items:[],
    links:[]
  },
  mutations: {
    config (state, config) {
      state.config = config

      Object.keys(state.api).forEach(function(key){
        state.api[key] = config.server + state.api[key] + config.suffix
      })
    },
    token (state, config) {
      state.token = config.token
      if (config.url_token != undefined) {
        state.config.suffix = state.config.suffix + config.token
      }
    },
    items (state, items) {
      state.items = items
    },
    linkadd (state, item) {
      if (state.links.length == 0) {
        state.links.push(item)

      } else {
        //console.log("去重")

        // 去重。。我知道这段代码写的很渣。。。
        // 要抱怨不如想想如何优雅的实现
        let t = 0
        for (let link of state.links) {
          if (link.id == item.id) {
            t = 1
          }
        }
        if (t == 0) {
          state.links.push(item)
        }
        // 渣代码结束

      }
    },
    linkdel (state, item_id) {
      //console.log("linkdel")
      //console.log(item)
      state.links = state.links.filter(tab => tab.id !== item_id)
    }
  }
})


new Vue({
  el: '#app',
  store,
  i18n,
  router,
  render: h => h(App)
})

