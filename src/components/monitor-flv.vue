<template>
  <div>
  <video ref="vvv" id="videoElement"></video>
            <el-button @click="play" type="danger" plain>play</el-button>
  </div>
</template>



<script>
import flvjs from 'flv.js'
//this.prototype.$flv = flvjs

  export default {
    data() {
      return {}
    },
    props: {
      source: {
        type: String,
        default: 'vertical'
      }
    },
    methods: {
      play() {
        if (flvjs.isSupported()) {
          console.log(this)
          //var videoElement = document.getElementById('videoElement');
          var videoElement = this.$refs.vvv
          var flvPlayer = flvjs.createPlayer({
            type: 'flv',
            url: 'http://127.0.0.1:7001/live/movie.flv'
          });
          flvPlayer.attachMediaElement(videoElement);
          flvPlayer.load();
          flvPlayer.play();
        }
      }
    }

  }


</script>
