import { EventEmitter } from 'events';

import mqtt from 'mqtt';
import jsonrpc from 'jsonrpc-lite';

import { transformMessage } from './mqtt-adapter';

class MqttClient extends EventEmitter {
  constructor() {
    super();
    this.seq = 0;
    this.queue = [];
    this.rpcIdPrefix = null;
    this.resolveMap = new Map();
  }

  static log(...args) {
    if (process.env.NODE_ENV === 'development') { // eslint-disable-line no-undef
      console.log('[MQTT]', ...args); // eslint-disable-line no-console
    }
  }

  /**
   * @param {string} topic
   * @returns {{ type: 'nodes'|'plans', id: number }}
   */
  static parseTopic(topic) {
    const parts = topic.split('/');
    return { type: parts[0], id: Number.parseInt(parts[1], 10) };
  }

  /**
   * @param {string} topic
   */
  static parseMsgCategory(topic) {
    const parts = topic.split('/');
    if (parts[0] !== 'nodes' && parts[2] !== 'msg') throw new TypeError(`No category in topic: ${topic}`);
    return parts[3];
  }

  /**
   * @param {number|string} prefix
   */
  setRpcPrefix(prefix) {
    this.rpcIdPrefix = prefix;
  }

  /**
   * @param {string} addr
   */
  connect(addr) {
    this.mqtt = mqtt.connect(addr, {
      keepalive: 15,
      clientId: `sdwc.${this.rpcIdPrefix}-${Date.now()}`
    });
    this.mqtt.on('connect', () => {
      MqttClient.log('connected to', addr);
      this.emit('connect');
      this.queue.forEach(task => {
        this._invoke.apply(this, task.arg)
          .then(task.resolve)
          .catch(task.reject);
      });
      this.queue = [];
    });
    this.mqtt.on('close', () => this.emit('close'));
    this.mqtt.on('message', (topic, message) => {
      const str = message.toString();
      const { type, id } = MqttClient.parseTopic(topic);
      MqttClient.log('msg:', topic, str);
      switch (type) {
        case 'nodes':
          this.onNodeMsg(topic, id, str);
          break;
        case 'plans':
          this.onPlanMsg(topic, id, str);
          break;
      }
    });
  }

  nextRpcId() {
    return `sdwc.${this.rpcIdPrefix}-${Date.now()}-${this.seq++}`;
  }

  /**
   * subscirbe `/nodes/:id/{rpc/{send,recv},message,status}`
   * @param {number|string} id node id
   */
  subscribeNode(id) {
    [
      `nodes/${id}/rpc/send`,
      `nodes/${id}/rpc/recv`,
      `nodes/${id}/message`,
      `nodes/${id}/status`
    ].forEach(topic => {
      this.mqtt.subscribe(topic);
    });
  }

  /**
   * subscirbe `/plans/:id/term`
   * @param {number|string} id plan id
   */
  subscribePlanTerm(id) {
    this.mqtt.subscribe(`plans/${id}/term`);
  }

  /**
   * subscirbe `/plans/:id/dialog` with callback
   * @param {number|string} id plan id
   * @param {(id: number, dialog: any) => void} callback
   */
  subscribePlanDialog(id, callback) {
    this.on('plan:dialog', callback);
    this.mqtt.subscribe(`plans/${id}/dialog`);
  }

  /**
   * **un**subscirbe `/plans/:id/dialog` with callback
   * @param {number|string} id plan id
   * @param {(id: number, dialog: any) => void} callback
   */
  unsubscribePlanDialog(id, callback) {
    this.off('plan:dialog', callback);
    this.mqtt.unsubscribe(`plans/${id}/dialog`);
  }

  /**
   * invoke rpc method, or add to queue if connection not ready.
   * @param {number|string} target target node id
   * @param {string} method method name
   * @param {any} arg method argument
   * @param {SDWC.MqttControlOptions} [options]
   * @returns {Promise<any>}
   */
  invoke(target, method, arg, options) {
    if (this.mqtt === undefined) {
      return new Promise((resolve, reject) => {
        this.queue.push({ arg: [target, method, arg, options], resolve, reject });
      });
    } else {
      return this._invoke.apply(this, arguments);
    }
  }

  /**
   * @private
   * invoke rpc method
   * @param {number|string} target target node id
   * @param {string} method method name
   * @param {any} arg method argument
   * @param {SDWC.MqttControlOptions} [options]
   */
  _invoke(target, method, arg, options = {}) {
    const rpcId = this.nextRpcId();
    const topicSend = `nodes/${target}/rpc/send`;
    let payload;
    if (options.notification) {
      payload = jsonrpc.notification(method, arg);
    } else {
      payload = jsonrpc.request(rpcId, method, arg);
    }
    this.mqtt.publish(topicSend, JSON.stringify(payload));
    MqttClient.log('pub:', payload);
    if (options.notification) {
      return Promise.resolve();
    } else {
      return new Promise((resolve, reject) => {
        this.resolveMap.set(rpcId, { resolve, reject });
      });
    }
  }

  /**
   * @param {string} topic
   * @param {number} id
   * @param {string} str
   */
  onNodeMsg(topic, id, str) {
    if (topic.endsWith('/rpc/send')) {
      this.onRpcSend(id, str);
    } else if (topic.endsWith('/rpc/recv')) {
      this.onRpcRecv(id, str);
    } else if (topic.includes('/msg/')) {
      const category = MqttClient.parseMsgCategory(topic);
      this.onMessage(id, str, category);
    } else if (topic.endsWith('/status')) {
      this.onStatus(id, str);
    } else {
      this.onMessageLegacy(id, str);
    }
  }

  /**
   * @param {number} id
   * @param {string} str
   */
  onRpcSend(id, str) {
    const request = jsonrpc.parse(str);
    switch (request.type) {
      case 'request':
      case 'notification':
        this.emit(`rpc:${request.type}`, { id, request });
        break;
    }
  }

  /**
   * @param {number} id
   * @param {string} str
   */
  onRpcRecv(id, str) {
    const response = jsonrpc.parse(str);
    this.emit('rpc:response', { id, response });
    const res = this.resolveMap.get(response.payload.id);
    if (!res) return;
    if (response.type === 'success') {
      res.resolve(response.payload.result);
    } else if (response.type === 'error') {
      res.reject(response.payload.error);
    } else {
      res.reject(response.payload);
    }
    this.resolveMap.delete(response.payload.id);
  }

  /**
   * @param {number} id
   * @param {string} str
   * @param {string} category
   */
  onMessage(id, str, category) {
    const msg = {
      [category]: JSON.parse(str)
    };
    this.emit('message', id, msg);
  }

  /**
   * @param {number} id
   * @param {string} str
   */
  onStatus(id, str) {
    if (str.trim().startsWith('{')) {
      const payload = JSON.parse(str);
      this.emit('status', id, payload);
    } else {
      const code = Number.parseInt(str, 10);
      this.emit('status', id, { legacy: true, code });
    }
  }

  /**
   * @param {number} id
   * @param {string} str
   */
  onMessageLegacy(id, str) {
    const msg = transformMessage(str);
    this.emit('message', id, msg);
  }


  /**
   * @param {string} topic
   * @param {number} id
   * @param {string} str
   */
  onPlanMsg(topic, id, str) {
    if (topic.endsWith('/term')) {
      this.emit('plan:term', id, str);
    } else if (topic.endsWith('/dialog')) {
      this.emit('plan:dialog', id, JSON.parse(str));
    }
  }

  /**
   * shut down mqtt connection and remove event listeners
   */
  disconnect() {
    if (!this.mqtt) return;
    return new Promise(resolve => {
      this.mqtt.end(false, resolve);
    });
  }
}

export default new MqttClient();
