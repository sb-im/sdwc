import Vue from 'vue'

import axios from 'axios'
Vue.prototype.$http = axios


import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

import App from './App.vue'
import App2 from './Login.vue'

Vue.use(ElementUI)

new Vue({
  el: '#app',
  render: h => h(App)
})


new Vue ({
  el: '#app2',
  render: h => h(App2)

})
