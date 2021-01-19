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

import { reloadVideo, WebSocketSignalingChannel } from './webrtc-client';

export default {
  name: 'sd-node-monitor-webrtc',
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
    createChannel() {
      const channel = new WebSocketSignalingChannel(this.point.name, this.$refs.video, this.config.ice_server);
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
      this.retryTimeout = setTimeout(() => this.createChannel(), 3 * 1000);
    },
    handleRetry() {
      this.couldRetry = false;
      this.msg = '';
      this.destroyChannel();
      this.createChannel();
    },
    reloadVideo() {
      reloadVideo(this.channel.pc.peerConnection, this.$refs.video);
    }
  },
  mounted() {
    this.channel = null;
    this.createChannel();
  },
  beforeDestroy() {
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
  top: 220px;
  width: 100%;
  text-align: center;
  z-index: 1;
}
</style>
