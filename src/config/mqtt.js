import mqtt from 'mqtt';
import jsonrpc from 'jsonrpc-lite';

class MqttClient {
  constructor() {
    this.topics = [];
    this._callId = 0;
    this.resolveMap = new Map();
  }

  connect(addr) {
    this.mqtt = mqtt.connect(addr);
    this.mqtt.on('connect', () => console.log('[MQTT] connected to', addr));
    this.mqtt.on('message', (topic, message) => {
      const str = message.toString();
      console.log('[MQTT] msg:', topic, str); // message is Buffer
      const result = jsonrpc.parse(str);
      const handler = this.resolveMap.get(result.payload.id);
      if (result.type === 'success') {
        if (handler.resolve) handler.resolve(result.payload.result);
      } else if (result.type === 'error') {
        if (handler.reject) handler.reject(result.payload.error);
      } else {
        if (handler.reject) handler.reject(result.payload);
      }
      this.resolveMap.delete(result.payload.id);
    });
  }

  nextCallId() {
    return `${this.mqtt.options.clientId}-${this._callId++}`;
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
