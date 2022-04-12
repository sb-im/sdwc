import Vue from 'vue';

import { Notification } from 'element-ui';

import i18n from '@/i18n';
import store from '@/store';
import router from '@/router';
import MqttClient from '@/api/mqtt';
import { RpcStatusClass } from '@/constants/rpc-status-class';
import { MutationTypes as NOTI } from '@/store/modules/notification';
import { NodeNotificationLevels } from '@/constants/node-notification-levels';

const RpcNotifications = new Map();

/**
 * @this {Vue}
 * @param {string} id
 * @param {SDWC.ControlItem} ctl
 * @param {SDWC.MqttRpcOptions} options
 */
export async function mqtt(id, { mission, arg = [] }, options = {}) {
  return MqttClient.invoke(id, mission, arg, options);
}

/**
 * ellipsis too long JSON values
 * @param {string} key
 * @param {any} value
 */
function replacer(key, value) {
  if (typeof value === 'string' && value.length > 10) {
    return '...';
  } else if (Array.isArray(value) && value.length > 2) {
    return '[...]';
  } else if (typeof value === 'object' && Object.keys(value).length > 2) {
    return '{...}';
  }
  return value;
}

/**
 * @param {import('jsonrpc-lite').RequestObject} _
 * @returns {string}
 */
function stringifyMission({ method, params }) {
  if (!params) {
    return method;
  }
  const a = JSON.stringify(params, replacer);
  if (a === '[]' || a === '{}') {
    return method;
  }
  return `${method} ${a}`;
}

function nextAnimationFrame() {
  return new Promise(resolve => requestAnimationFrame(resolve));
}

/**
 * @param {Partial<SDWC.NotificationItem>} n
 * @param {boolean} mod
 */
async function emitNotification(n, mod = false) {
  if (router.currentRoute.meta.suppressNotify) return;
  if (store.state.notification.findIndex(item => item.id === n.id) > -1) {
    mod = true;
  }
  store.commit(mod ? NOTI.MOD_NOTI : NOTI.ADD_NOTI, n);
  if (!store.state.preference.rpcMsgPopup || n.prefix === 'Status') return;
  if (mod) {
    const rn = RpcNotifications.get(n.id);
    if (!rn) return;
    rn.$data.iconClass = RpcStatusClass[n.status];
  } else {
    /**
     * An element-ui `Notification` needs other instances' offsetHeight to
     * calculate its own offset, see:
     * https://github.com/ElemeFE/element/blob/v2.15.5/packages/notification/src/main.js#L40
     * If 2 `Notification`s were created at the same time, they would overlap.
     * So we need to wait layout to finish before creating `Notification`.
     */
    await nextAnimationFrame();
    const [title, message] = n.title.split(' : ');
    const rn = Notification({
      offset: 50,
      title,
      message,
      iconClass: RpcStatusClass[n.status],
      customClass: 'rpc-msg--popup',
      onClose: () => RpcNotifications.delete(n.id)
    });
    RpcNotifications.set(n.id, rn);
  }
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
  let notificationId = 0;
  MqttClient.on('rpc:notification', ({ id, request }) => {
    const node = store.state.node.find(node => node.info.id === id).info;
    if (!node) return;
    const now = Date.now();
    emitNotification({
      id: `nodes/${id}/notif/${notificationId++}`,
      time: now,
      prefix: 'Notification',
      status: 3,
      title: `${node.name} : ${stringifyMission(request.payload)}`
    });
  });
  MqttClient.on('rpc:response', ({ response }) => {
    const status = response.type === 'success' ? 0 : 2;
    emitNotification({ id: response.payload.id, status }, true);
  });
}

function registerStatusListener() {
  MqttClient.on('status', (id, { code }) => {
    const node = store.state.node.find(node => node.info.id === id);
    if (!node || node.status.code === code) return;
    const now = Date.now();
    const st = i18n.t(`common.status.${code}`);
    emitNotification({
      id: `nodes/${id}/status/${now}`,
      time: now,
      prefix: 'Status',
      status: code,
      title: `${node.info.name} : ${st}`
    });
  });
}

function registerNotificationListener() {
  MqttClient.on('message', (id, msg) => {
    if (router.currentRoute.meta.suppressNotify) return;
    /** @type {SDWC.NodeNotification} */
    const n = msg.notification;
    if (!n) return;
    const node = store.state.node.find(node => node.info.id === id);
    if (!node || store.state.preference.notifyNoPopup.includes(node.info.id)) return;
    const notify = Notification({
      offset: 50,
      message: 'REPLACED_BY_VNODE',
      customClass: 'status-notify--popup'
    });
    const h = notify.$createElement;
    const level = NodeNotificationLevels[n.level] || {};
    notify.$slots.default = [
      h('div', null, [
        h('span', { class: 'status-notify__title' }, [node.info.name]),
        h('span', null, [' · ', i18n.d(n.time * 1000, 'seconds')]),
      ]),
      h('span', { class: ['status-notify__level', level.class] }),
      h('span', null, [n.msg])
    ];
  });
}

Vue.use({
  install(Vue) {
    Vue.prototype.$mqtt = mqtt;
    registerRpcListener();
    registerStatusListener();
    registerNotificationListener();
  }
});
