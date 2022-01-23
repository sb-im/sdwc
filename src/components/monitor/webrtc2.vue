<script>
import WebRTCBase from './webrtc-base.vue';

import { WebRTC2Client } from './webrtc2-client';

export default {
  extends: WebRTCBase,
  name: 'sd-node-monitor-webrtc2',
  methods: {
    createClient() {
      this.msg = this.$t('monitor.connecting');
      this.couldRetry = false;
      const client = new WebRTC2Client(this.iceServer);
      client.on('candidatecomplete', () => {
        this.$mqtt(this.point.node_id, {
          mission: 'webrtc',
          arg: client.pc.localDescription
        }).then(remoteSdp => {
          client.startSession(remoteSdp);
        });
      });
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
      return client;
    },
    destroyClient() {
      if (!this.client) return;
      this.$refs.video.srcObject = null;
      this.client.destroy();
      this.client = null;
    },
    handleRetry() {
      this.destroyClient();
      this.client = this.createClient();
    }
  },
  mounted() {
    this.client = this.createClient();
  },
  beforeDestroy() {
    this.destroyClient();
  }
};
</script>
