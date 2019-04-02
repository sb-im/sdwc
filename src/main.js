import Vue from 'vue';

import './element';
import i18n from './i18n';
import store from './store';
import router from './router';

import App from './App.vue';
import './style.css';

new Vue({
  store,
  i18n,
  router,
  ...App
}).$mount(document.getElementById('app'));
