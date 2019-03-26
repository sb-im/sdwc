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

  /**
   * @param {string} topic
   */
  static parseNodeId(topic) {
    const [_, id] = /^nodes\/(\d+)\//.exec(topic);
    return id;
  }

  setIdPrefix(prefix) {
    this.rpcIdPrefix = prefix;
  }

  connect(addr) {
    this.mqtt = mqtt.connect(addr, {
      clientId: `sdwc-${this.rpcIdPrefix}-${Date.now()}`
    });
    this.mqtt.on('connect', () => console.log('[MQTT] connected to', addr));
    this.mqtt.on('message', (topic, message) => {
      const str = message.toString();
      const id = MqttClient.parseNodeId(topic);
      console.log('[MQTT] msg:', topic, str);
      if (topic.endsWith('/rpc/recv')) {
        const result = jsonrpc.parse(str);
        if (topic.endsWith('/rpc/recv')) {
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
        }
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
   * subscirbe to `/nodes/:id/rpc/recv`
   * @param {string} id node id
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
   * @param {string} target
   * @param {string} method method name
   * @param {any[]} argArray argument array
   */
  invoke(target, method, argArray) {
    if (this.rpcIdPrefix === null) return;
    const id = this.nextCallId();
    const topicSend = `nodes/${target}/rpc/send`;
    const payload = jsonrpc.request(id, method, argArray);
    this.mqtt.publish(topicSend, JSON.stringify(payload));
    console.log('[MQTT] pub:', payload);
    return new Promise((resolve, reject) => {
      this.resolveMap.set(id, { resolve, reject });
    });
  }
}

const client = new MqttClient();

export default client;
