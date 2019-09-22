// @ts-check

import { EventEmitter } from 'events';

export function trace() {
  // @ts-ignore
  if (process.env.NODE_ENV === 'development') { // eslint-disable-line
    console.debug.apply(console, arguments);    // eslint-disable-line
  }
}

function randStr(len = 5) {
  return Math.random().toString().slice(2, len + 2);
}

/**
 * @see https://github.com/kclyu/rpi-webrtc-streamer/blob/6881a5cc9571807bf16372b020ae96e5d64b891c/web-root/native-peerconnection/js/peerconnection_client.js
 */
class PeerConnectionClient {
  /**
   * @param {HTMLVideoElement} videoElem
   * @param {Function} doSendPeerMessage
   * @param {string} iceServer
   */
  constructor(videoElem, doSendPeerMessage, iceServer) {
    /**
     * configuration for peerconnection
     * @type {RTCConfiguration}
     */
    this.pcConfig = {
      iceServers: [
        { urls: iceServer || 'stun:stun.l.google.com:19302' }
      ]
    };
    this.messageCounter = 0;
    this.doSendPeerMessage = doSendPeerMessage;
    this.videoElem = videoElem;
    this.startTime = performance.now();
    //  PeerConnection
    this.peerConnection = new RTCPeerConnection(this.pcConfig);
    trace('Create RTCPeerConnnection with config:', this.pcConfig);
    this.peerConnection.addEventListener('icecandidate', ev => this.onIceCandidate(ev));
    this.peerConnection.addEventListener('track', ev => this.onRemoteStreamAdded(ev));
    this.peerConnection.addEventListener('signalingstatechange', ev => this.onSignalingStateChanged(ev));
    this.peerConnection.addEventListener('iceconnectionstatechange', ev => this.onIceConnectionStateChanged(ev));
  }

  onIceCandidate(event) {
    if (event.candidate) {
      var message = {
        type: 'candidate',
        label: event.candidate.sdpMLineIndex,
        id: event.candidate.sdpMid,
        candidate: event.candidate.candidate
      };
      trace('Sending IceCandidate:', message);
      this.doSendPeerMessage(message);
    } else {
      trace('End of candidates.');
    }
  }

  onIceConnectionStateChanged(event) {
    const state = event.target.iceConnectionState;
    trace('ICE connection state changed to:', state);
    if (state === 'completed') {
      const ms = (window.performance.now() - this.startTime).toFixed(0);
      trace(`ICE complete time: ${ms} ms.`);
    }
  }

  onSignalingStateChanged(event) {
    trace('Signaling state changed to:', event.target.signalingState);
  }

  close() {
    if (!this.peerConnection) {
      return;
    }
    this.peerConnection.close();
    this.peerConnection = null;
  }

  onRemoteStreamAdded(event) {
    if (!this.videoElem) {
      trace('Error: Video Element is empty');
      return;
    }
    trace('Remote stream added:', event.streams);
    this.videoElem.srcObject = event.streams[0];
  }

  setLocalSdpAndSend(sessionDescription) {
    this.peerConnection.setLocalDescription(sessionDescription)
      .then(() => trace('Set local session description success.'))
      .catch(e => trace('setLocalDescription', e));
    this.doSendPeerMessage(sessionDescription);
  }

  onReceivePeerMessage(data) {
    this.messageCounter++;
    const dataJson = JSON.parse(data);
    trace('onReceived Message Type:', dataJson.type);
    if (dataJson.type == 'offer') { // Processing offer
      trace('Offer from PeerConnection.');
      this.peerConnection.setRemoteDescription(new RTCSessionDescription(dataJson))
        .then(() => trace('Set session description success.'))
        .catch(e => trace('setRemoteDescription', e));
      trace('Sending answer to peer.');
      this.peerConnection.createAnswer()
        .then(this.setLocalSdpAndSend.bind(this))
        .catch(e => trace('createAnswer', e));
    } else if (dataJson.type == 'candidate') { // Processing candidate
      const ice_candidate = new RTCIceCandidate({
        sdpMLineIndex: dataJson.label,
        sdpMid: dataJson.id,
        candidate: dataJson.candidate
      });
      this.peerConnection.addIceCandidate(ice_candidate)
        .then(() => trace('Remote candidate added successfully.'))
        .catch(e => trace('addIceCandidate', e));
    }
  }
}

/**
 * @see https://github.com/kclyu/rpi-webrtc-streamer/blob/6881a5cc9571807bf16372b020ae96e5d64b891c/web-root/native-peerconnection/js/websocket_signaling.js
 */
export class WebSocketSignalingChannel extends EventEmitter {
  /**
   * @param {string} url
   * @param {HTMLVideoElement} videoElem
   * @param {string} iceServer
   */
  constructor(url, videoElem, iceServer) {
    super();
    this.url = url;
    this.iceServer = iceServer;
    this.pc = new PeerConnectionClient(videoElem, this.sendPeerMessage.bind(this), this.iceServer);
    this.ws = new WebSocket(url);
    this.ws.addEventListener('open', () => {
      trace('Websocket connnected:', this.ws.url);
      this.registerSingal();
    });
    this.ws.addEventListener('close', () => {
      trace('Websocket Disconnected');
      this.emit('ws:close');
      this.pc.close();
      this.pc = null;
    });
    this.ws.addEventListener('message', event => {
      var dataJson = JSON.parse(event.data);
      trace('WSS -> C:', dataJson);
      if (dataJson.cmd == 'send') {
        this.pc.onReceivePeerMessage(dataJson.msg);
      } if (dataJson.cmd === 'event') {
        this.emit('event', dataJson);
      }
    });
    this.ws.addEventListener('error', event => {
      trace('An error occured while connecting:', event);
      this.emit('ws:error', event);
    });
    this.pc.peerConnection.addEventListener('iceconnectionstatechange', event => {
      /** @type {RTCIceConnectionState} */
      // @ts-ignore
      const state = event.target.iceConnectionState;
      this.emit(`pc:${state}`);
    });
  }

  sendWebsocket(message) {
    if (this.ws.readyState == WebSocket.OPEN || this.ws.readyState == WebSocket.CONNECTING) {
      trace('C -> WSS:', message);
      this.ws.send(JSON.stringify(message));
      return true;
    }
    trace('failed to send websocket message:', message);
    return false;
  }

  sendPeerMessage(data) {
    var data_message = {
      cmd: 'send',
      msg: JSON.stringify(data),
      error: ''
    };
    if (this.sendWebsocket(data_message) === false) {
      trace('Failed to send data:', data_message);
      return false;
    }
    return true;
  }

  registerSingal() {
    // No Room concept, random generate room and client id.
    var register = {
      cmd: 'register',
      roomid: randStr(9),
      clientid: randStr(8)
    };
    this.sendWebsocket(register);
  }

  close() {
    this.ws.close();
  }
}
