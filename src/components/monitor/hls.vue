<template>
  <video class="monitor-video" ref="video"></video>
</template>

<script>
export default {
  name: 'sd-node-monitor-hls',
  props: {
    source: {
      type: String,
      required: true
    }
  },
  methods: {
    loadHls() {
      import(/* webpackChunkName: "hls" */ 'hls.js/dist/hls.light').then(({ default: Hls }) => {
        if (Hls.isSupported()) {
          this.hls = new Hls();
          this.hls.loadSource(this.source);
          this.hls.attachMedia(this.$refs.video);
          this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
            this.$refs.video.play();
          });
        }
      });
    }
  },
  mounted() {
    this.hls = null;
    this.loadHls();
  },
  beforeDestroy() {
    if (this.hls) {
      this.hls.destroy();
    }
  }
};
</script>
