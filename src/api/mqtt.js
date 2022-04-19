// @ts-check

import { EventEmitter2 } from 'eventemitter2';

import mqtt from 'mqtt';
import jsonrpc from 'jsonrpc-lite';

export class MqttClient extends EventEmitter2 {
  constructor() {
    super();
    this.lastPing = -1;
    this.delay = -1;
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

  static warn(...args) {
    console.warn('[MQTT]', ...args); // eslint-disable-line no-console
  }

  /**
   * possible topic format:
   * - `nodes/:id/{status,network}`
   * - `nodes/:id/rpc/{send,recv}`
   * - `nodes/:id/msg/{position,battery,weather,...}`
   * - `tasks/:id/{term,dialog,running}`
   * @param {string} topic
   * @returns {SDWC.MqttTopicInfo}
   */
  static parseTopic(topic) {
    const parts = topic.split('/');
    const result = {
      entity: parts[0],
      id: Number.parseInt(parts[1], 10),
      category: parts[2],
      param: parts[3]
    };
    return result;
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
      this.ping();
      this.emit('connect');
      this.queue.forEach(task => {
        this._invoke.apply(this, task.arg)
          .then(task.resolve)
          .catch(task.reject);
      });
      this.queue = [];
    });
    this.mqtt.on('close', () => this.emit('close'));
    this.mqtt.on('packetsend', packet => {
      if (packet.cmd === 'pingreq') {
        this.lastPing = Date.now();
      }
    });
    this.mqtt.on('packetreceive', packet => {
      if (packet.cmd === 'pingresp' && this.lastPing > 0) {
        this.delay = Date.now() - this.lastPing;
        this.emit('ping', this.delay);
      }
    });
    this.mqtt.on('message', (topic, message) => {
      const str = message.toString();
      const t = MqttClient.parseTopic(topic);
      MqttClient.log('msg:', topic, str);
      try {
        switch (t.entity) {
          case 'nodes':
            this.onNode(t, str);
            break;
          case 'tasks':
            this.onPlan(t, str);
            break;
          default:
            MqttClient.warn(`Unknown entity "${t.entity}" in topic "${topic}", with payload:`, str);
            break;
        }
      } catch (e) {
        MqttClient.warn(`Error when processing message in topic "${topic}", with payload:`, str, e);
      }
    });
  }

  nextRpcId() {
    return `sdwc.${this.rpcIdPrefix}-${Date.now()}-${this.seq++}`;
  }

  ping() {
    // @ts-ignore
    this.mqtt._sendPacket({ cmd: 'pingreq' });
  }

  /**
   * subscirbe `/nodes/:id/{rpc/{send,recv},message,status}`
   * @param {number|string} id node id
   */
  subscribeNode(id) {
    [
      `nodes/${id}/rpc/send`,
      `nodes/${id}/rpc/recv`,
      `nodes/${id}/network`,
      `nodes/${id}/status`
    ].forEach(topic => {
      this.mqtt.subscribe(topic);
    });
  }

  /**
   * subscirbe `/tasks/:id/{term,dialog,running}`
   * @param {number|string} id plan id
   */
  subscribePlan(id) {
    [
      `tasks/${id}/term`,
      `tasks/${id}/dialog`,
      `tasks/${id}/running`
    ].forEach(topic => {
      this.mqtt.subscribe(topic);
    });
  }

  /**
   * invoke node rpc method, or add to queue if connection not ready.
   * @param {number|string} target target node id
   * @param {string} method method name
   * @param {any} arg method argument
   * @param {SDWC.MqttRpcOptions} [options]
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
   * @param {SDWC.MqttRpcOptions} [options]
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
   * respond to task dialog
   * @param {number} target task id
   * @param {string} message button message
   */
  respond(target, message) {
    this.mqtt.publish(`tasks/${target}/term`, message);
  }

  /**
   * @param {SDWC.MqttTopicInfo} topic
   * @param {string} str
   */
  onNode(topic, str) {
    switch (topic.category) {
      case 'status':
        this.emit('node:status', { id: topic.id, status: JSON.parse(str) });
        break;
      case 'network':
        this.emit('node:network', { id: topic.id, network: JSON.parse(str) });
        break;
      case 'rpc':
        switch (topic.param) {
          case 'send':
            this.onNodeRpcSend(topic.id, str);
            break;
          case 'recv':
            this.onNodeRpcRecv(topic.id, str);
            break;
        }
        break;
      case 'msg':
        this.emit('node:message', { id: topic.id, msg: { [topic.param]: JSON.parse(str) } });
        break;
      default:
        MqttClient.warn(`Unknown category "${topic.category}", with payload:`, str);
        break;
    }
  }

  /**
   * @param {number} id
   * @param {string} str
   */
  onNodeRpcSend(id, str) {
    /** @type {import('jsonrpc-lite').IParsedObject} */  // @ts-ignore
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
  onNodeRpcRecv(id, str) {
    /** @type {import('jsonrpc-lite').IParsedObject} */  // @ts-ignore
    const response = jsonrpc.parse(str);
    this.emit('rpc:response', { id, response });
    // @ts-ignore
    const res = this.resolveMap.get(response.payload.id);
    if (!res) return;
    switch (response.type) {
      case 'success':
        res.resolve(response.payload.result);
        break;
      case 'error':
        res.reject(response.payload.error);
        break;
      default:
        res.reject(response.payload);
        break;
    }
    // @ts-ignore
    this.resolveMap.delete(response.payload.id);
  }

  /**
   * @param {SDWC.MqttTopicInfo} topic
   * @param {string} str
   */
  onPlan(topic, str) {
    switch (topic.category) {
      case 'term':
        this.emit('plan', topic.id, str, undefined);
        break;
      case 'dialog':
        this.emit('plan', topic.id, null, JSON.parse(str));
        break;
      case 'running':
        this.emit('plan_running', topic.id, JSON.parse(str));
        break;
      default:
        MqttClient.warn(`Unknown category "${topic.category}", with payload:`, str);
        break;
    }
  }

  /**
   * shutdown mqtt connection and remove event listeners
   */
  disconnect() {
    if (!this.mqtt) return;
    return new Promise(resolve => {
      this.mqtt.end(false, resolve);
    });
  }
}

export default new MqttClient();
