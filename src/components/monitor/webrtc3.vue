<script>
import WebRTCBase from './webrtc-base.vue';

import { WebRTC3Client } from './webrtc3-client';

export default {
  extends: WebRTCBase,
  name: 'sd-node-monitor-webrtc3',
  methods: {
    async createClient() {
      this.msg = this.$t('monitor.connecting');
      this.couldRetry = false;
      const result = await this.$mqtt(this.point.node_id, {
        mission: 'webrtc3',
        arg: { url: this.point.name }
      });
      const client = new WebRTC3Client(this.ice_server, result.url);
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
