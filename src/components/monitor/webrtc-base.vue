<template>
  <div class="monitor-webrtc">
    <video class="monitor-video" ref="video" autoplay muted :style="videoStyle"></video>
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
export default {
  props: {
    point: {
      type: Object,
      required: true
    },
    objectFit: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      msg: '',
      couldRetry: false
    };
  },
  computed: {
    /** @returns {string} */
    videoStyle() {
      if (!this.objectFit) return '';
      return `object-fit:${this.objectFit}`;
    },
    /** @returns {SDWC.Config} */
    config() { return this.$store.state.config; },
    /** @returns {string | RTCIceServer[]} */
    iceServer() {
      return this.config.ice_servers || this.config.ice_server;
    }
  },
  methods: {
    handleRetry() {
      throw new Error('Not implemented');
    }
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
