<template>
  <video id="video"></video>
</template>

<script>

import Hls from 'hls.js'

  export default {
    data() {
      return {}
    },
    props: {
      source: {
        type: String,
        required: true,
        default: 'https://video-dev.github.io/streams/x36xhzz/x36xhzz.m3u8'
      }
    },
    mounted() {
      this.play()
    },
    beforeDestroy() {
      this.hls.destroy()
    },
    methods: {
      play() {
        if(Hls.isSupported()) {
          var video = document.getElementById('video');
          var hls = new Hls();
          hls.loadSource(this.source);
            hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED,function() {
            video.play();
          });
          this.hls = hls
        }
      }

    }
  }


</script>
