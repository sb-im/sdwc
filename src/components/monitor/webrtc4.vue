<script>
import WebRTCBase from './webrtc-base.vue';

import { WebRTC4Client } from './webrtc4-client';

export default {
  extends: WebRTCBase,
  name: 'sd-node-monitor-webrtc4',
  methods: {
    async createClient() {
      this.msg = this.$t('monitor.connecting');
      this.couldRetry = false;
      const { signal_url, id, track_source } = this.point.params.broadcast;
      const client = new WebRTC4Client(this.iceServer, signal_url, id, track_source);
      client.on('icestatechange', (/** @type {RTCIceConnectionState} */ state) => {
        switch (state) {
          case 'connected':
            this.msg = '';
            break;
          case 'disconnected':
            this.couldRetry = true;
            this.msg = this.$t('monitor.disconnected');
            break;
        }
      });
      client.on('track', (/** @type {MediaStream[]} */ streams) => {
        this.$refs.video.srcObject = streams[0];
      });
      this.client = client;
    },
    destroyClient() {
      if (!this.client) return;
      this.$refs.video.srcObject = null;
      this.client.destroy();
      this.client = null;
    },
    handleRetry() {
      this.destroyClient();
      this.createClient();
    }
  },
  created() {
    this.createClient();
  },
  beforeDestroy() {
    this.destroyClient();
  }
};
</script>
