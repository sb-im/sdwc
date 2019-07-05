import Vue from 'vue';

import './util/element';
import i18n from './i18n';
import './util/plugin-mqtt';
import store from './store';
import router from './router';

import App from './App.vue';
import './style.css';
import 'chartist/dist/chartist.min.css';
import 'chartist-plugin-tooltips/dist/chartist-plugin-tooltip.css';

store.dispatch('configure');
/**
 * Restore user token (if avaliable) before Vue instance was created.
 * Makes `store.state.user` equals to restored state when enter router
 * for the very first time.
 */
store.dispatch('restoreSession');
store.dispatch('restorePreference');

const el = document.createElement('div');
document.body.appendChild(el);
new Vue({
  store,
  i18n,
  router,
  ...App
}).$mount(el);

window.addEventListener('beforeunload', () => {
  store.dispatch('storePreference');
});
