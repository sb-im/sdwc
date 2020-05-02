<template>
  <video class="monitor-video" ref="video"></video>
</template>

<script>
export default {
  name: 'sd-node-monitor-flv',
  props: {
    point: {
      type: Object,
      required: true
    }
  },
  methods: {
    loadPlayer() {
      import(/* webpackChunkName: 'flv' */ 'flv.js/dist/flv').then(({ default: flvjs }) => {
        if (flvjs.isSupported()) {
          this.player = flvjs.createPlayer(
            {
              type: 'flv',
              isLive: true,
              hasAudio: false,
              hasVideo: true,
              url: this.point.name
            },
            {
              enableWorker: true,
              enableStashBuffer: false
            }
          );
          this.player.attachMediaElement(this.$refs.video);
          this.player.load();
          this.player.play();
        }
      });
    },
    destroyPlayer() {
      this.player.pause();
      this.player.unload();
      this.player.detachMediaElement();
      this.player.destroy();
    }
  },
  mounted() {
    this.player = null;
    this.loadPlayer();
  },
  beforeDestroy() {
    this.destroyPlayer();
  }
};
</script>
