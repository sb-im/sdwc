<template>
  <video class="monitor-video" ref="video"></video>
</template>

<script>
import flvjs from 'flv.js';

export default {
  name: 'sd-node-monitor-flv',
  props: {
    source: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      /** @type {flvjs.Player} */
      player: null
    };
  },
  methods: {
    loadPlayer() {
      if (flvjs.isSupported()) {
        this.player = flvjs.createPlayer(
          {
            type: 'flv',
            isLive: true,
            hasAudio: false,
            hasVideo: true,
            url: this.source
          },
          {
            enableWorker: true,
            enableStashBuffer: false,
            stashInitialSize: 128
          }
        );
        this.player.attachMediaElement(this.$refs.video);
        this.player.load();
        this.player.play();
      }
    },
    destroyPlayer() {
      this.player.pause();
      this.player.unload();
      this.player.detachMediaElement();
      this.player.destroy();
    }
  },
  mounted() {
    this.loadPlayer();
  },
  beforeDestroy() {
    this.destroyPlayer();
  }
};
</script>
