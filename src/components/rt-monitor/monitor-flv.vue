<template>
  <video ref="video"></video>
</template>



<script>
  import flvjs from 'flv.js'

  export default {
    data() {
      return {
        flvPlayer: null
      }
    },
    props: {
      source: {
        type: String,
        required: true,
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
          let videoEl = this.$refs.video,
            flvPlayer = flvjs.createPlayer({
              type: 'flv',
              isLive: true,
              hasAudio: false,
              hasVideo: true,
              url: this.source
            }, {
              enableWorker: true,
              enableStashBuffer: false,
              stashInitialSize: 128,// 减少首桢显示等待时长
            });
          flvPlayer.attachMediaElement(videoEl);
          flvPlayer.load();
          flvPlayer.play();
          this.flvPlayer = flvPlayer;
        }
      },
      flv_destroy() {
        var player = this.flvPlayer;
        player.pause();
        player.unload();
        player.detachMediaElement();
        player.destroy();
        this.flvPlayer = player = null;
      }
    }
  }
</script>
