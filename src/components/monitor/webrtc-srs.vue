<script>
import WebRTCBase from './webrtc-base.vue';

import { WebRTCSRSClient } from './webrtc-srs-client';

export default {
  extends: WebRTCBase,
  name: 'sd-node-monitor-webrtc-srs',
  methods: {
    createClient() {
      this.msg = this.$t('monitor.connecting');
      this.couldRetry = false;
      const client = new WebRTCSRSClient(this.iceServer);
      client.on('track', (/** @type {MediaStream[]} */ streams) => {
        this.$refs.video.srcObject = streams[0];
      });
      client.play(this.point.params.url).then(session => {
        this.session = session;
        this.msg = '';
        this.couldRetry = false;
      }).catch(e => {
        this.msg = e;
        this.couldRetry = true;
      });
      return client;
    },
    destroyClient() {
      if (!this.client) return;
      this.$refs.video.srcObject = null;
      this.client.close();
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
