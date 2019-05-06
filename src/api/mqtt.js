import { EventEmitter } from 'events';

import mqtt from 'mqtt';
import jsonrpc from 'jsonrpc-lite';

class MqttClient extends EventEmitter {
  constructor() {
    super();
    this.queue = [];
    this.topics = [];
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
   */
  static parseNodeId(topic) {
    const [_, id] = /^nodes\/(\d+)\//.exec(topic); // eslint-disable-line no-unused-vars
    return Number.parseInt(id, 10);
  }

  /**
   * @param {string} prefix
   */
  setIdPrefix(prefix) {
    this.rpcIdPrefix = prefix;
  }

  /**
   * @param {string} addr
   */
  connect(addr) {
    this.mqtt = mqtt.connect(addr, {
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
    this.mqtt.on('message', (topic, message) => {
      const str = message.toString();
      const id = MqttClient.parseNodeId(topic);
      MqttClient.log('msg:', topic, str);
      if (topic.endsWith('/rpc/send')) {
        /** @type {import('jsonrpc-lite').IParsedObjectRequest} */
        const request = jsonrpc.parse(str);
        if (request.type === 'request') {
          this.emit('rpc:request', { id, request: request });
        }
      } else if (topic.endsWith('/rpc/recv')) {
        const result = jsonrpc.parse(str);
        this.emit('rpc:response', { id, response: result });
        const handler = this.resolveMap.get(result.payload.id);
        if (!handler) return;
        if (result.type === 'success') {
          if (handler.resolve) handler.resolve(result.payload.result);
        } else if (result.type === 'error') {
          if (handler.reject) handler.reject(result.payload.error);
        } else {
          if (handler.reject) handler.reject(result.payload);
        }
        this.resolveMap.delete(result.payload.id);
      } else if (topic.endsWith('/status')) {
        this.emit('status', { id, status: Number.parseInt(str, 10) });
      } else if (topic.endsWith('/message')) {
        this.emit('message', { id, message: str });
      }
    });
  }

  nextRpcId() {
    return `sdwc.${this.rpcIdPrefix}-${Date.now()}`;
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
      if (this.topics.indexOf(topic) < 0) {
        this.mqtt.subscribe(topic);
      }
    });
  }

  /**
   * invoke rpc method, or add to queue if connection not ready.
   * @param {number|string} target target node id
   * @param {string} method method name
   * @param {any[]} arg argument array
   */
  invoke(target, method, arg) {
    if (this.mqtt === undefined || this.mqtt.connected === false) {
      return new Promise((resolve, reject) => {
        this.queue.push({ arg: [target, method, arg], resolve, reject });
      });
    } else {
      return this._invoke.apply(this, arguments);
    }
  }

  /**
   * invoke rpc method
   * @param {number|string} target target node id
   * @param {string} method method name
   * @param {any[]} arg argument array
   */
  _invoke(target, method, arg) {
    const rpcId = this.nextRpcId();
    const topicSend = `nodes/${target}/rpc/send`;
    const payload = jsonrpc.request(rpcId, method, arg);
    this.mqtt.publish(topicSend, JSON.stringify(payload));
    MqttClient.log('pub:', payload);
    return new Promise((resolve, reject) => {
      this.resolveMap.set(rpcId, { resolve, reject });
    });
  }
}

export default new MqttClient();
