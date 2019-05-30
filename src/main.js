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

/**
 * Restore user token (if avaliable) before Vue instance was created.
 * Makes `store.state.user` equals to restored state when enter router
 * for the very first time.
 */
store.dispatch('reconfigure');
store.dispatch('restorePreference');
store.subscribe(mutation => {
  if (mutation.type === 'SET_NODE_STATUS') {
    store.dispatch('getDepotPosition', mutation.payload.id);
  }
});

new Vue({
  store,
  i18n,
  router,
  ...App
}).$mount(document.getElementById('app'));

window.addEventListener('beforeunload', () => {
  store.dispatch('storePreference');
});
