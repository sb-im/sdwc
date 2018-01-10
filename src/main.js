import Vue from 'vue'

import axios from 'axios'
Vue.prototype.$http = axios


import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

import App from './App.vue'
import Login from './Login.vue'

Vue.component('my-component', Login)

Vue.use(ElementUI)

new Vue({
  el: '#app',
  render: h => h(App)
})

