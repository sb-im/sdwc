<template>
  <div class="monitor-webrtc">
    <video class="monitor-video" ref="video" autoplay controls muted></video>
    <div class="monitor-webrtc__overlay">
      <span v-if="this.msg" class="monitor__tip">{{ this.msg }}</span>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
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
      msg: '',
      /** @type {WebSocketSignalingChannel} */
      channel: null
    };
  },
  computed: {
    ...mapState([
      'config'
    ])
  },
  methods: {
    createChannel() {
      this.channel = new WebSocketSignalingChannel(this.source, this.$refs.video, this.config.ice_server);
      this.channel.on('event', ev => {
        if (ev.type === 'error' || ev.type === 'notice') {
          this.msg = ev.mesg;
        }
      });
      this.channel.on('pc:connected', () => this.msg = '');
      this.channel.once('ws:error', () => this.recreateChannel());
      this.channel.once('pc:closed', () => this.recreateChannel());
    },
    destroyChannel() {
      this.channel.close();
      this.channel.removeAllListeners();
    },
    recreateChannel() {
      this.destroyChannel();
      this.retryTimeout = setTimeout(() => this.createChannel(), 3 * 1000);
    }
  },
  mounted() {
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
}
</style>
