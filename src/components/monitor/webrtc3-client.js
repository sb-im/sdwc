import { EventEmitter } from 'events';

import { trace } from './webrtc-client';

export class WebRTC3Client extends EventEmitter {
  /**
   * @param {string | RTCIceServer[]} iceServer
   * @param {string} cableURL
   */
  constructor(iceServer, cableURL) {
    super();
    const cable = new WebSocket(cableURL);
    this.cable = cable;
    cable.addEventListener('open', () => this.onCableOpen());
    cable.addEventListener('close', () => this.onCableClose());
    cable.addEventListener('message', e => this.onCableMessage(e));
    const pc = new RTCPeerConnection({ iceServers: typeof iceServer === 'string' ? [{ urls: iceServer }] : iceServer });
    this.pc = pc;
    pc.addEventListener('iceconnectionstatechange', () => this.onIceConnStateChange());
    pc.addEventListener('icecandidate', e => this.onIceCandidate(e));
    pc.addEventListener('track', e => this.onTrack(e));
  }

  cableSend(data) {
    trace('cableSend', data);
    this.cable.send(typeof data === 'string' ? data : JSON.stringify(data));
  }

  onCableOpen() {
    trace('onCableOpen');
    this.cableSend('SESSION_OK');
  }

  onCableClose() {
    trace('onCableClose');
  }

  /**
   * @param {WebSocketEventMap} event
   */
  onCableMessage(event) {
    trace('onCableMessage', event.data);
    try {
      const msg = JSON.parse(event.data);
      if (msg.sdp) {
        this.onRemoteSdp(msg.sdp);
      } else if (msg.ice) {
        this.onRemoteIceCandidate(msg.ice);
      }
    } catch (e) { /* noop */ }
  }

  async onRemoteSdp(sdp) {
    trace('onRemoteSdp', sdp);
    this.pc.addTransceiver('video', { direction: 'recvonly' });
    await this.pc.setRemoteDescription(sdp);
    const answer = await this.pc.createAnswer();
    this.pc.setLocalDescription(answer);
    this.cableSend({ sdp: answer });
  }

  onRemoteIceCandidate(ice) {
    trace('onRemoteCandidate', ice);
    this.pc.addIceCandidate(ice);
  }

  onIceConnStateChange() {
    trace('onIceConnStateChange', this.pc.iceConnectionState);
    this.emit('icestatechange', this.pc.iceConnectionState);
  }

  /**
   * @param {RTCPeerConnectionIceEvent} ev
   */
  onIceCandidate(ev) {
    // Use `turn` need this
    trace('onIceCandidate', ev.candidate);
    if (event.candidate) {
      this.cableSend({ ice: ev.candidate });
    }
  }

  /**
   * @param {RTCTrackEvent} ev
   */
  onTrack(ev) {
    trace('onTrack', ev.streams);
    this.emit('track', ev.streams);
  }

  destroy() {
    this.cable.close();
    this.pc.close();
  }
}
