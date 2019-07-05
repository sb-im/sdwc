import Vue from 'vue';
import Notification from 'element-ui/lib/notification';

import i18n from '@/i18n';
import store from '@/store';
import MqttClient from '@/api/mqtt';

const NotifyMap = new Map();

/**
 * @this {Vue}
 * @param {number} id
 * @param {SDWC.ControlItem} ctl
 */
async function mqtt(id, { mission, arg = [] }) {
  return MqttClient.invoke(id, mission, arg);
}

function stringifyMission({ method, params }) {
  const a = JSON.stringify(params);
  if (a === '[]' || a === '{}') {
    return method;
  }
  return `${method} ${a}`;
}

function registerMqttListener() {
  MqttClient.on('rpc:request', ({ id, request }) => {
    let prefix = request.payload.id.split('-')[0];
    if (prefix.startsWith('sdwc')) {
      prefix = '';
    } else {
      prefix = `(${prefix}) `;
    }
    const node = store.state.node.find(node => node.info.id === id).info;
    const name = stringifyMission(request.payload);
    if (!node) {
      Notification({
        duration: 0,
        type: 'error',
        title: `${prefix}node#${id} : ${name}`,
        message: 'ERR: NO_SUCH_NODE'
      });
      return;
    }
    /**
     * mutate element-ui's Notification object
     * @see https://github.com/ElemeFE/element/blob/v2.8.2/packages/notification/src/index.js
     */
    const n = Notification({
      duration: 0,
      type: 'info',
      title: `${prefix}${node.name} : ${name}`,
      message: i18n.t('common.operate_pending')
    });
    NotifyMap.set(request.payload.id, n);
  });
  MqttClient.on('rpc:response', ({ response }) => {
    if (!NotifyMap.has(response.payload.id)) return;
    const n = NotifyMap.get(response.payload.id);
    /**
     * mutate element-ui's Notification object
     * @see https://github.com/ElemeFE/element/blob/v2.8.2/packages/notification/src/main.vue
     */
    if (response.type === 'success') {
      n.$data.type = 'success';
      n.$data.message = i18n.t('common.operate_success');
      n.$data.duration = 2000;
      n.startTimer();
    } else {
      n.$data.type = 'error';
      n.$data.message = i18n.t('common.operate_error');
    }
    NotifyMap.delete(response.payload.id);
  });
}

Vue.use({
  install(Vue) {
    Vue.prototype.$mqtt = mqtt;
    registerMqttListener();
  }
});
