import { EventEmitter } from 'events';

import { trace } from './webrtc-client';

export class WebRTC2Client extends EventEmitter {
  /**
   * @param {HTMLVideoElement} video
   * @param {string} iceServer
   */
  constructor(video, iceServer, sender) {
    super();
    this.video = video;
    this.sender = sender;

    const pc = new RTCPeerConnection(typeof iceServer === "string"
      ? {iceServers: [{ urls: iceServer }]}
      : {iceServers: iceServer});
    this.pc = pc;
    pc.addEventListener('iceconnectionstatechange', () => this.onIceConnStateChange());
    pc.addEventListener('icecandidate', ev => this.onIceCandidate(ev));
    pc.addEventListener('track', ev => this.onTrack(ev));
    pc.addTransceiver('video', { direction: 'recvonly' });

    pc.createOffer().then(d => pc.setLocalDescription(d)).catch(console.log)
  }

  onIceConnStateChange() {
    trace('IceConnStateChange', this.pc.iceConnectionState);
    this.emit('ice', this.pc.iceConnectionState);
  }

  /**
   * @param {RTCPeerConnectionIceEvent} ev
   */
  onIceCandidate(ev) {
    // Use `turn` need this
    if (event.candidate === null) {
      trace('IceCandidate', ev.candidate);
      this.sender(this.pc.localDescription)
    }
  }

  /**
   * @param {RTCTrackEvent} ev
   */
  onTrack(ev) {
    trace('Track', ev.streams);
    this.video.srcObject = ev.streams[0];
    this.emit('track');
  }

  async createOffer() {
    const localSdp = await this.pc.createOffer();
    await this.pc.setLocalDescription(localSdp);
    return localSdp;
  }

  /**
   * @param {Partial<RTCSessionDescription>} remoteSdp
   */
  startSession(remoteSdp) {
    return this.pc.setRemoteDescription(remoteSdp);
  }

  destroy() {
    this.video.srcObject = null;
    this.pc.close();
  }
}
