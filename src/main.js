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

Vue.use(JSONTreeView);

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

MqttClient.on('close', () => store.commit(UI.SET_UI, { mqttConnected: false }));
MqttClient.on('connect', () => store.commit(UI.SET_UI, { mqttConnected: true }));
MqttClient.on('status', async (id, payload) => {
  if (!payload.legacy) {
    store.commit(NODE.SET_NODE_STATUS, { id, payload });
    return;
  }
  if (payload.code === 0) {
    const node = store.state.node.find(n => n.info.id === id);
    if (node.info.type_name === 'depot') {
      await store.dispatch('updateDepotStatus', id);
    }
    store.commit(NODE.SET_NODE_STATUS, { id, payload });
  }
});
MqttClient.on('message', (id, msg) => {
  store.commit(NODE.ADD_NODE_MSG, { id, msg });
});
MqttClient.on('plan', (id, output, dialog) => {
  store.commit(PLAN.ADD_PLAN_MSG, { id, output, dialog });
});
MqttClient.on('plan_status', (id, data) => {
  store.commit(PLAN.SET_PLAN_STATUS, { id, data });
});

if (__SDWC_DEV__) {
  import(/* webpackChunkName: 'development' */ './styles/development.css');
  const el = document.createElement('div');
  el.classList.add('development-ribbon');
  document.body.append(el);
}
