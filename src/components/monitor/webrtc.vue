<script>
import WebRTCBase from './webrtc-base.vue';

import { WebSocketSignalingChannel } from './webrtc-client';

export default {
  extends: WebRTCBase,
  name: 'sd-node-monitor-webrtc',
  methods: {
    createChannel() {
      this.couldRetry = false;
      const channel = new WebSocketSignalingChannel(this.point.name, this.$refs.video, this.iceServer);
      channel.on('event', ev => {
        if (ev.type === 'error' || ev.type === 'notice') {
          this.msg = ev.mesg;
          this.couldRetry = true;
        }
      });
      this.msg = this.$t('monitor.connecting');
      channel.on('pc:connected', () => this.msg = '');
      channel.once('ws:error', () => this.recreateChannel());
      channel.once('pc:closed', () => this.recreateChannel());
      channel.once('pc:failed', () => this.recreateChannel());
      channel.once('pc:disconnected', () => this.recreateChannel());
      this.channel = channel;
    },
    destroyChannel() {
      this.channel.removeAllListeners();
      this.channel.close();
    },
    recreateChannel() {
      this.destroyChannel();
      this.retryTimeout = setTimeout(() => {
        this.retryTimeout = 0;
        this.createChannel();
      }, 3 * 1000);
    },
    handleRetry() {
      this.msg = '';
      this.destroyChannel();
      this.createChannel();
    }
  },
  mounted() {
    this.channel = null;
    this.createChannel();
  },
  beforeDestroy() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
      delete this.retryTimeout;
    }
    this.destroyChannel();
  }
};
</script>

<style>
.monitor-webrtc {
  position: relative;
}
.monitor-webrtc__overlay {
  position: absolute;
  top: calc(50% - 16px);
  width: 100%;
  text-align: center;
  z-index: 1;
}
</style>
