<template>
  <video autoplay ref="video"></video>
</template>

<script>
import { WebSocketSignalingChannel } from './monitor-webrtc-client';

export default {
  props: {
    source: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      channel: null
    }
  },
  mounted() {
    this.channel = new WebSocketSignalingChannel(this.source, this.$refs.video);
  },
  beforeDestroy() {
    this.channel.closeSingal();
  }
}
</script>
