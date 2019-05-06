<template>
  <video class="monitor-video" ref="video" autoplay></video>
</template>

<script>
import { WebSocketSignalingChannel } from './webrtc-client';

export default {
  name: 'sd-node-mointor-webrtc',
  props: {
    source: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      /** @type {WebSocketSignalingChannel} */
      channel: null
    };
  },
  mounted() {
    this.channel = new WebSocketSignalingChannel(this.source, this.$refs.video, this.$store.state.config.ice_server);
  },
  beforeDestroy() {
    this.channel.closeSingal();
  }
};
</script>
