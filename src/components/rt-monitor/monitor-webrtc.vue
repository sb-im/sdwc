<template>
  <div v-if="errMsg" class="rt-monitor-tip-empty">{{ errMsg }}</div>
  <video v-else autoplay controls ref="video"></video>
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
      errMsg: '',
      retryTimeout: 0,
      channel: null
    }
  },
  methods: {
    createChannel() {
      this.channel = new WebSocketSignalingChannel(this.source, this.$refs.video, this.$store.state.config.ice_server);
      this.channel.on('event', ev => {
        if (ev.type === 'error' || ev.type === 'notice') {
          this.errMsg = ev.mesg;
        }
      });
      this.channel.on('pc:connected', () => this.errMsg = '');
      this.channel.once('ws:error', () => this.recreateChannel());
      this.channel.once('pc:closed', () => this.recreateChannel());
    },
    recreateChannel() {
      this.destroyChannel();
      this.retryTimeout = setTimeout(() => this.createChannel(), 3 * 1000);
    },
    destroyChannel() {
      this.channel.close();
      this.channel.removeAllListeners();
    }
  },
  mounted() {
    this.createChannel();
  },
  beforeDestroy() {
    this.destroyChannel();
    window.clearTimeout(this.retryTimeout);
  }
}
</script>
