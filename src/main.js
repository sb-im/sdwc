import Vue from 'vue';

import './element';
import i18n from './i18n';
import store from './store';
import router from './router';

import App from './App.vue';
import './style.css';

/**
 * Restore user token (if avaliable) before Vue instance was created.
 * Makes `store.state.user` equals to restored state when enter router
 * for the very first time.
 */
store.dispatch('reconfigure');

new Vue({
  store,
  i18n,
  router,
  ...App
}).$mount(document.getElementById('app'));
