// @ts-check

import { EventEmitter2 } from 'eventemitter2';

import { trace } from './webrtc-client';

export class WebRTC4Client extends EventEmitter2 {
  /**
   * @param {string | RTCIceServer[]} iceServer
   * @param {string} signalURL
   * @param {string} id
   * @param {number} trackSource
   */
  constructor(iceServer, signalURL, id, trackSource) {
    super();
    this.id = id;
    this.traceSource = trackSource;
    this.candidates = [];
    const signal = new WebSocket(signalURL);
    this.signal = signal;
    signal.addEventListener('open', () => this.onSignalOpen());
    signal.addEventListener('close', e => this.onSignalClose(e));
    signal.addEventListener('message', e => this.onSignalMessage(e));
    const pc = new RTCPeerConnection({ iceServers: typeof iceServer === 'string' ? [{ urls: iceServer }] : iceServer });
    this.pc = pc;
    this.pcAnswered = false;
    pc.addEventListener('iceconnectionstatechange', () => this.onIceConnStateChange());
    pc.addEventListener('icecandidate', e => this.onIceCandidate(e));
    pc.addEventListener('track', e => this.onTrack(e));
    pc.addTransceiver('video');
  }

  /**
   * @param {'video-offer' | 'new-ice-candidate'} event
   * @param {'sdp' | 'candidate'} key
   * @param {any} value
   */
  signalSend(event, key, value) {
    const json = JSON.stringify({
      event,
      id: Date.now().toString(),
      data: {
        meta: {
          id: this.id,
          track_source: this.traceSource
        },
        [key]: JSON.stringify(value)
      }
    });
    trace('signalSend', json);
    this.signal.send(json);
  }

  onSignalOpen() {
    trace('onSignalOpen');
    this.pc.createOffer().then(offer => {
      this.pc.setLocalDescription(offer);
      this.signalSend('video-offer', 'sdp', offer);
    });
  }

  onSignalClose(e) {
    trace('onSignalClose', e);
  }

  /**
   * @param {MessageEvent<string>} event
   */
  onSignalMessage(event) {
    trace('onSignalMessage', event.data);
    const msg = JSON.parse(event.data);
    switch (msg.event) {
      case 'error':
        this.emit('error', msg.data);
        // eslint-disable-next-line no-console
        console.error('[webrtc4] error message from signal channel:', msg.data);
        break;
      case 'new-ice-candidate':
        this.onRemoteIceCandidate(JSON.parse(msg.data.candidate));
        break;
      case 'video-answer':
        this.onRemoteSdp(JSON.parse(msg.data.sdp));
        break;
    }
  }

  async onRemoteSdp(sdp) {
    trace('onRemoteSdp', sdp);
    await this.pc.setRemoteDescription(sdp);
    this.pcAnswered = true;
    this.candidates.forEach(c => this.pc.addIceCandidate(c));
    this.candidates = [];
  }

  onRemoteIceCandidate(candidate) {
    trace('onRemoteCandidate', candidate);
    if (this.pcAnswered) {
      this.pc.addIceCandidate(candidate);
    } else {
      this.candidates.push(candidate);
    }
  }

  onIceConnStateChange() {
    trace('onIceConnStateChange', this.pc.iceConnectionState);
    this.emit('icestatechange', this.pc.iceConnectionState);
  }

  /**
   * @param {RTCPeerConnectionIceEvent} ev
   */
  onIceCandidate(ev) {
    trace('onIceCandidate', ev.candidate);
    if (ev.candidate) {
      this.signalSend('new-ice-candidate', 'candidate', ev.candidate);
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
    this.signal.close();
    this.pc.close();
  }
}
