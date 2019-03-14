import mqtt from 'mqtt';
import jsonrpc from 'jsonrpc-lite';
import config from '../../config.json';

class MqttClient {
  constructor(addr) {
    this.topics = [];
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
    this._callId = 0;
    this.resolveMap = new Map();
  }

  nextCallId() {
    return `${this.mqtt.options.clientId}-${this._callId++}`;
  }

  /**
   * invoke rpc method
   * @param {string} target
   * @param {string} method method name
   * @param {any[]} argArray argument array
   */
  invoke(target, method, argArray) {
    const topicRecv = `/nodes/${target}/rpc/recv`;
    if (this.topics.indexOf(topicRecv) < 0) {
      this.mqtt.subscribe(topicRecv);
    }
    const id = this.nextCallId();
    const payload = jsonrpc.request(id, method, argArray);
    this.mqtt.publish(`/nodes/${target}/rpc/send`, JSON.stringify(payload));
    return new Promise((resolve, reject) => {
      this.resolveMap.set(id, { resolve, reject });
    });
  }
}

const client = new MqttClient(config.mqtt_url);

export default client;
