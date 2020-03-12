<template>
  <div class="monitor-webrtc">
    <video class="monitor-video" ref="video" autoplay muted></video>
    <div class="monitor-webrtc__overlay">
      <template v-if="this.msg">
        <div class="monitor__tip">{{ this.msg }}</div>
        <el-button
          v-show="couldRetry"
          size="small"
          icon="el-icon-refresh-right"
          @click="handleRetry"
        >
          <span v-t="'common.retry'"></span>
        </el-button>
      </template>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

import { WebRTC3Client } from './webrtc3-client';

export default {
  name: 'sd-node-monitor-webrtc3',
  props: {
    point: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      msg: '',
      couldRetry: false
    };
  },
  computed: {
    ...mapState([
      'config'
    ])
  },
  methods: {
    async createClient() {
      this.msg = this.$t('monitor.connecting');
      this.couldRetry = true;
      const result = await this.$mqtt(this.point.node_id, {
        mission: 'webrtc3',
        arg: { url: this.point.name }
      });
      const client = new WebRTC3Client(this.config.ice_servers || this.config.ice_server, result.url);
      client.on('icestatechange', (/** @type {RTCIceConnectionState} */ state) => {
        switch (state) {
          case 'connected':
            this.msg = '';
            break;
          case 'checking':
            this.couldRetry = false;
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
      this.couldRetry = false;
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
