import { EventEmitter } from 'events';

function trace() {
  // @ts-ignore
  if (process.env.NODE_ENV === 'development') { // eslint-disable-line
    console.debug.apply(console, arguments);    // eslint-disable-line
  }
}

export class WebRTC2Client extends EventEmitter {
  /**
   * @param {HTMLVideoElement} video
   * @param {string} iceServer
   */
  constructor(video, iceServer) {
    super();
    this.video = video;
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: iceServer || 'stun:stun.l.google.com:19302' }
      ]
    });
    this.pc = pc;
    pc.addEventListener('iceconnectionstatechange', () => this.onIceConnStateChange());
    pc.addEventListener('icecandidate', ev => this.onIceCandidate(ev));
    pc.addEventListener('track', ev => this.onTrack(ev));
    pc.addTransceiver('video', { direction: 'recvonly' });
  }

  onIceConnStateChange() {
    trace('IceConnStateChange', this.pc.iceConnectionState);
    this.emit('ice', this.pc.iceConnectionState);
  }

  /**
   * @param {RTCPeerConnectionIceEvent} ev
   */
  onIceCandidate(ev) {
    trace('IceCandidate', ev.candidate);
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
