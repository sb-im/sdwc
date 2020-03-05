import Vue from 'vue';

import './util/element';
import i18n from './i18n';
import './util/plugin-mqtt';
import store from './store';
import { MutationTypes as USER } from './store/modules/user';
import router from './router';
import './util/browser-hacks';

import App from './App.vue';
import './styles/global.css';
import 'chartist';
import 'chartist-plugin-tooltips';
import 'chartist/dist/chartist.min.css';
import 'chartist-plugin-tooltips/dist/chartist-plugin-tooltip.css';
import './styles/chartist.css';

const configurePromise = store.dispatch('configure');
/**
 * Restore user token (if avaliable) before Vue instance was created.
 * Makes `store.state.user` equals to restored state when enter router
 * for the very first time.
 */
store.dispatch('restoreSession');
store.dispatch('restorePreference');

window.addEventListener('beforeunload', () => {
  store.dispatch('storePreference');
});

const el = document.createElement('div');
document.body.appendChild(el);
const app = new Vue({
  el,
  store,
  i18n,
  router,
  provide: { configurePromise },
  extends: App
});

store.subscribe((mutation) => {
  if (mutation.type === USER.INVALIDATE_TOKEN) {
    store.dispatch('logout');
    router.replace({ name: 'login' });
    app.$message({
      type: 'error',
      duration: 0,
      message: i18n.t('login.expired')
    });
  }
});

if (__SDWC_DEV__) {
  import('./styles/development.css');
  const el = document.createElement('div');
  el.classList.add('development-ribbon');
  document.body.append(el);
}
