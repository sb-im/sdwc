// @ts-check

function trace() {
  // @ts-ignore
  if (process.env.NODE_ENV === 'development') {
    console.debug.apply(console, arguments);
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
    this.peerConnection.onicecandidate = this.onIceCandidate.bind(this);
    this.peerConnection.ontrack = this.onRemoteStreamAdded.bind(this);
    this.peerConnection.onsignalingstatechange = this.onSignalingStateChanged.bind(this);
    this.peerConnection.oniceconnectionstatechange = this.onIceConnectionStateChanged.bind(this);
  }

  onIceCandidate(event) {
    if (!this.peerConnection) {
      return;
    }
    if (event.candidate) {
      var message = {
        type: 'candidate',
        label: event.candidate.sdpMLineIndex,
        id: event.candidate.sdpMid,
        candidate: event.candidate.candidate
      };
      trace('Sending IceCandidate :', message);
      this.doSendPeerMessage(message);
    }
    else {
      trace('End of candidates.');
    }
  }

  onIceConnectionStateChanged() {
    if (!this.peerConnection) {
      return;
    }
    trace('ICE connection state changed to:', this.peerConnection.iceConnectionState);
    if (this.peerConnection.iceConnectionState === 'completed') {
      const ms = (window.performance.now() - this.startTime).toFixed(0);
      trace(`ICE complete time: ${ms} ms.`);
    }
  }

  onSignalingStateChanged() {
    if (!this.peerConnection) {
      return;
    }
    trace('Signaling state changed to: ', this.peerConnection.signalingState);
  }

  close() {
    if (!this.peerConnection) {
      return;
    }
    this.peerConnection.close();
    this.peerConnection = null;
  }

  onRemoteStreamAdded(event) {
    if (!this.peerConnection) {
      return;
    }
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
    trace('onReceived Message Type :', dataJson.type);
    if (dataJson.type == 'offer') { // Processing offer
      trace('Offer from PeerConnection.');
      this.peerConnection.setRemoteDescription(new RTCSessionDescription(dataJson))
        .then(() => trace('Set session description success.'))
        .catch(e => trace('setRemoteDescription', e));
      trace('Sending answer to peer.');
      this.peerConnection.createAnswer()
        .then(this.setLocalSdpAndSend.bind(this))
        .catch(e => trace('createAnswer', e));
    }
    else if (dataJson.type == 'candidate') { // Processing candidate
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
export class WebSocketSignalingChannel {
  /**
   * @param {string} url
   * @param {HTMLVideoElement} videoElem
   * @param {string} iceServer
   */
  constructor(url, videoElem, iceServer) {
    this.url = url;
    this.iceServer = iceServer;
    this.pc = new PeerConnectionClient(videoElem, this.sendPeerMessage.bind(this), this.iceServer);
    this.ws = new WebSocket(url);
    this.ws.onopen = () => {
      trace('Websocket connnected:', this.ws.url);
      this.registerSingal();
    };
    this.ws.onclose = () => {
      trace('Websocket Disconnected');
      this.closeSingal();
      this.pc.close();
      this.pc = null;
    };
    this.ws.onmessage = event => {
      var dataJson = JSON.parse(event.data);
      trace('WSS -> C:', dataJson);
      if (dataJson.cmd == 'send') {
        this.pc.onReceivePeerMessage(dataJson.msg);
      }
    };
    this.ws.onerror = event => {
      trace('An error occured while connecting :', event);
    };
  }

  sendWebsocket(message) {
    if (this.ws.readyState == WebSocket.OPEN || this.ws.readyState == WebSocket.CONNECTING) {
      trace('C --> WSS:', message);
      this.ws.send(JSON.stringify(message));
      return true;
    }
    trace('failed to send websocket message :', message);
    return new Error('failed to send websocket message');
  }

  sendPeerMessage(data) {
    var data_message = {
      cmd: 'send',
      msg: JSON.stringify(data),
      error: ''
    };
    if (this.sendWebsocket(data_message) == false) {
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

  closeSingal() {
    if (this.ws.readyState == 1) {
      this.ws.close();
    }
  }
}
