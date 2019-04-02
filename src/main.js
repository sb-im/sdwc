import Vue from 'vue';

import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

import i18n from './i18n';
import store from './store';
import router from './router';

import App from './App.vue';
import './style.css';

Vue.use(ElementUI, {
  i18n: (key, value) => i18n.t(key, value)
});

new Vue({
  store,
  i18n,
  router,
  ...App
}).$mount(document.getElementById('app'));
