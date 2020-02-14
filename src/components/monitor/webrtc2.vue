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

import { WebRTC2Client } from './webrtc2-client';

export default {
  name: 'sd-node-monitor-webrtc2',
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
    createClient() {
      this.msg = this.$t('monitor.connecting');
      this.couldRetry = true;
      const client = new WebRTC2Client(this.config.ice_servers || this.config.ice_server);
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
      return client;
    },
    handleRetry() {
      if (this.client) {
        this.$refs.video.srcObject = null;
        this.client.destroy();
        this.client = null;
      }
      this.couldRetry = false;
      this.client = this.createClient();
    }
  },
  mounted() {
    this.client = this.createClient();
  },
  beforeDestroy() {
    if (this.client) {
      this.$refs.video.srcObject = null;
      this.client.destroy();
      this.client = null;
    }
  }
};
</script>
