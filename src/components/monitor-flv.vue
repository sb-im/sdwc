<template>
  <video ref="vvv"></video>
</template>



<script>
import flvjs from 'flv.js'

  export default {
    data() {
      return {}
    },
    props: {
      source: {
        type: String,
        default: 'http://127.0.0.1:7001/live/movie.flv'
      }
    },
    mounted() {
      this.play()
    },
    beforeDestroy() {
      this.flv_destroy()
    },
    methods: {
      play() {
        if (flvjs.isSupported()) {
          console.log(this)
          //var videoElement = document.getElementById('videoElement');
          var videoElement = this.$refs.vvv
          var flvPlayer = flvjs.createPlayer({
            type: 'flv',
            url: this.source
          });
          flvPlayer.attachMediaElement(videoElement);
          flvPlayer.load();
          flvPlayer.play();
          this.flvPlayer = flvPlayer
        }
      },
      flv_destroy() {
        var player = this.flvPlayer
        player.pause();
        player.unload();
        player.detachMediaElement();
        player.destroy();
        player = null;
      }
    }

  }


</script>
