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

import { reloadVideo } from './webrtc-client';
import { WebRTC4Client } from './webrtc4-client';

export default {
  name: 'sd-node-monitor-webrtc4',
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
      const iceServers = this.config.ice_servers || this.config.ice_server;
      const { signal_url, id, track_source } = this.point.params.broadcast;
      const client = new WebRTC4Client(iceServers, signal_url, id, track_source);
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
    },
    reloadVideo() {
      reloadVideo(this.client.pc, this.$refs.video);
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
