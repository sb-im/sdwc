<template>
  <video class="monitor-video" ref="video"></video>
</template>

<script>
import Hls from 'hls.js';

export default {
  name: 'sd-node-monitor-hls',
  props: {
    source: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      /** @type {Hls} */
      hls: null
    };
  },
  methods: {
    loadHls() {
      if (Hls.isSupported()) {
        this.hls = new Hls();
        this.hls.loadSource(this.source);
        this.hls.attachMedia(this.$refs.video);
        this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
          this.$refs.video.play();
        });
      }
    }
  },
  mounted() {
    this.loadHls();
  },
  beforeDestroy() {
    if (this.hls) {
      this.hls.destroy();
    }
  }
};
</script>
