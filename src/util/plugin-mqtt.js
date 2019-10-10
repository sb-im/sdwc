import Vue from 'vue';

import i18n from '@/i18n';
import store from '@/store';
import { MutationTypes as NOTI } from '@/store/modules/notification';
import MqttClient from '@/api/mqtt';

/**
 * @this {Vue}
 * @param {number} id
 * @param {SDWC.ControlItem} ctl
 */
async function mqtt(id, { mission, arg = [] }) {
  return MqttClient.invoke(id, mission, arg);
}

/**
 * ellipsis too long JSON values
 * @param {string} key
 * @param {any} value
 */
function replacer(key, value) {
  if (typeof value === 'string' && value.length > 10) {
    return '...';
  }
  return value;
}

function stringifyMission({ method, params }) {
  const a = JSON.stringify(params, replacer);
  if (a === '[]' || a === '{}') {
    return method;
  }
  return `${method} ${a}`;
}

/**
 * @param {SDWC.NotificationItem} n
 * @param {boolean} mod
 */
function emitNotification(n, mod = false) {
  store.commit(mod ? NOTI.MOD_NOTI : NOTI.ADD_NOTI, n);
}

function registerRpcListener() {
  MqttClient.on('rpc:request', ({ id, request }) => {
    let prefix = request.payload.id.split('-')[0];
    const node = store.state.node.find(node => node.info.id === id).info;
    if (!node) return;
    emitNotification({
      id: request.payload.id,
      time: Date.now(),
      prefix,
      status: 1,
      title: `${node.name} : ${stringifyMission(request.payload)}`
    });
  });
  MqttClient.on('rpc:response', ({ response }) => {
    const status = response.type === 'success' ? 0 : 2;
    emitNotification({ id: response.payload.id, status }, true);
  });
}

function getStatusText(status) {
  switch (status) {
    case 0: return i18n.t('header.normal');
    case 1: return i18n.t('header.shutdown');
    case 2: return i18n.t('header.net_error');
    default: return i18n.t('header.never_online');
  }
}

function registerStatusListener() {
  MqttClient.on('status', ({ id, code }) => {
    const node = store.state.node.find(node => node.info.id === id);
    if (!node || node.status === -1 || node.status === code) return;
    emitNotification({
      id: `sdwc-node/${id}/status/${Date.now()}`,
      prefix: 'status',
      title: `${node.info.name} : ${getStatusText(code)}`,
      status: code
    });
  });
}

Vue.use({
  install(Vue) {
    Vue.prototype.$mqtt = mqtt;
    registerRpcListener();
    registerStatusListener();
  }
});
