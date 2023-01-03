import Vue from 'vue';

// side-effect
import './util/element';
import './util/plugin-mqtt';
import './util/browser-hacks';

// styles
import 'chartist/dist/chartist.min.css';
import 'chartist-plugin-tooltips/dist/chartist-plugin-tooltip.css';
import './styles/global.css';
import './styles/chartist.css';

// App part
import App from './App.vue';
import i18n from './i18n';
import store from './store';
import router from './router';
import MqttClient from './api/mqtt';
import { MutationTypes as UI } from './store/modules/ui';
import { MutationTypes as USER } from './store/modules/user';
import { MutationTypes as NODE } from './store/modules/node';
import { MutationTypes as PLAN } from './store/modules/plan';

// 3rd-party
import 'chartist';
import 'chartist-plugin-tooltips';
import JSONTreeView from 'vue-json-tree-view/src/index';
import { ifvisible } from 'ifvisible.js';

Vue.use(JSONTreeView);

async function enableIdleCheck() {
  // 'eager' mode prevents webpack from generating extra chunk for this module
  const { ifvisible } = await import(/* webpackMode: 'eager' */ 'ifvisible.js');
  ifvisible.setIdleDuration(store.state.config.idle_timeout);
  ifvisible.on('idle', () => store.dispatch('handleUserIdle'));
  ifvisible.on('wakeup', () => store.commit(UI.SET_UI, { idle: false }));
}

const configurePromise = store.dispatch('configure');
/**
 * Restore user token (if avaliable) before Vue instance was created.
 * Makes `store.state.user` equals to restored state when enter router
 * for the very first time.
 */
store.dispatch('restoreSession');
store.dispatch('restorePreference');
/**
 * re-initialize data and connections after configure completed and session
 * restored
 */
configurePromise.then(async () => {
  if (store.getters.authenticated) {
    store.dispatch('initialize');
    if (!store.state.user.credential.implicit) {
      // enable idle check when not in single user mode
      enableIdleCheck();
    }
    return;
  }
  const isSingleUserMode = await store.dispatch('checkSingleUserMode');
  if (isSingleUserMode) {
    store.dispatch('initialize');
    const { name, query } = router.currentRoute;
    if (name === 'login' && query.redir) {
      router.replace(query.redir);
    } else {
      router.replace({ name: 'panel' });
    }
  } else {
    // enable idle check when not in single user mode
    enableIdleCheck();
  }
});

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
    router.replace({ name: 'login' });
    app.$message({
      type: 'error',
      duration: 0,
      message: i18n.t('login.expired')
    });
  }
});

MqttClient.on('close', () => store.commit(UI.SET_UI, { mqttConnected: false }));
MqttClient.on('connect', () => store.commit(UI.SET_UI, { mqttConnected: true }));
MqttClient.on('ping', delay => store.commit(UI.SET_UI, { mqttDelay: delay }));

MqttClient.on('node:status', arg => store.commit(NODE.SET_NODE_STATUS, arg));
MqttClient.on('node:network', arg => store.commit(NODE.SET_NODE_NETWORK, arg));
MqttClient.on('node:message', arg => store.commit(NODE.ADD_NODE_MSG, arg));

MqttClient.on('plan:term', arg => store.commit(PLAN.ADD_PLAN_TERM, arg));
MqttClient.on('plan:dialog', arg => store.commit(PLAN.SET_PLAN_DIALOG, arg));
MqttClient.on('plan:running', arg => store.commit(PLAN.SET_PLAN_RUNNING, arg));
MqttClient.on('plan:notification', arg => store.commit(PLAN.ADD_PLAN_NOTIFY, arg));

if (__SDWC_DEV__) {
  // 'DEVELOPMENT' badge
  import(/* webpackChunkName: 'development' */ './styles/development.css');
  const el = document.createElement('div');
  el.classList.add('development-ribbon');
  document.body.append(el);
  // attach mqttclient to window
  import('@/api/mqtt').then(c => {
    window._mqttClient = c.default;
  });
  window._ifvisible = ifvisible;
}
