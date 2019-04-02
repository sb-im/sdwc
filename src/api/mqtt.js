import { EventEmitter } from 'events';

import mqtt from 'mqtt';
import jsonrpc from 'jsonrpc-lite';

class MqttClient extends EventEmitter {
  constructor() {
    super();
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
      clientId: `sdwc-${this.rpcIdPrefix}-${Date.now()}`
    });
    this.mqtt.on('connect', () => MqttClient.log('connected to', addr));
    this.mqtt.on('message', (topic, message) => {
      const str = message.toString();
      const id = MqttClient.parseNodeId(topic);
      MqttClient.log('msg:', topic, str);
      if (topic.endsWith('/rpc/recv')) {
        const result = jsonrpc.parse(str);
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

  nextCallId() {
    return `sdwc-${this.rpcIdPrefix}-${Date.now()}`;
  }

  /**
   * subscirbe `/nodes/:id/{rpc/recv,message,status}`
   * @param {number|string} id node id
   */
  subscribeNode(id) {
    [
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
   * invoke rpc method
   * @param {number|string} target target node id
   * @param {string} method method name
   * @param {any[]} argArray argument array
   */
  invoke(target, method, argArray) {
    if (this.rpcIdPrefix === null) return;
    const id = this.nextCallId();
    const topicSend = `nodes/${target}/rpc/send`;
    const payload = jsonrpc.request(id, method, argArray);
    this.mqtt.publish(topicSend, JSON.stringify(payload));
    MqttClient.log('pub:', payload);
    return new Promise((resolve, reject) => {
      this.resolveMap.set(id, { resolve, reject });
    });
  }
}

export default new MqttClient();
