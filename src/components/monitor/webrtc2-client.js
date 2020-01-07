import { EventEmitter } from 'events';

import { trace } from './webrtc-client';

export class WebRTC2Client extends EventEmitter {
  /**
   * @param {string | RTCIceServer[]} iceServer
   */
  constructor(iceServer) {
    super();
    /** @type {RTCConfiguration} */
    const configuration = {
      iceServers: typeof iceServer === 'string' ? [{ urls: iceServer }] : iceServer
    };
    const pc = new RTCPeerConnection(configuration);
    this.pc = pc;
    pc.addEventListener('iceconnectionstatechange', () => this.onIceConnStateChange());
    pc.addEventListener('icecandidate', ev => this.onIceCandidate(ev));
    pc.addEventListener('track', ev => this.onTrack(ev));
    pc.addTransceiver('video', { direction: 'recvonly' });
    pc.createOffer().then(offer => {
      trace('createOffer', offer);
      pc.setLocalDescription(offer);
    }).catch(e => trace('ERROR: createOffer', e));
  }

  onIceConnStateChange() {
    trace('IceConnStateChange', this.pc.iceConnectionState);
    this.emit('icestatechange', this.pc.iceConnectionState);
  }

  /**
   * @param {RTCPeerConnectionIceEvent} ev
   */
  onIceCandidate(ev) {
    // Use `turn` need this
    trace('IceCandidate', ev.candidate);
    if (event.candidate === null) {
      this.emit('candidatecomplete');
    }
  }

  /**
   * @param {RTCTrackEvent} ev
   */
  onTrack(ev) {
    trace('Track', ev.streams);
    this.emit('track', ev.streams);
  }

  /**
   * @param {Partial<RTCSessionDescription>} remoteSdp
   */
  startSession(remoteSdp) {
    return this.pc.setRemoteDescription(remoteSdp);
  }

  destroy() {
    this.pc.close();
  }
}
