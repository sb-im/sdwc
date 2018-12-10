<template>

  <!--<video :src="source"></video>-->
  <video-player class="vjs-custom-skin" ref="videoPlayer" :options="playerOptions" @timeupdate="onTimeupdate">
  </video-player>
  <!--customEventName="customstatechangedeventname"

    @play="onPlayerPlay($event)"
    @pause="onPlayerPause($event)"
    @ended="onPlayerEnded($event)"
    @waiting="onPlayerWaiting($event)"
    @playing="onPlayerPlaying($event)"
    @loadeddata="onPlayerLoadeddata($event)"
    @timeupdate="onPlayerTimeupdate($event)"
    @canplay="onPlayerCanplay($event)"
    @canplaythrough="onPlayerCanplaythrough($event)"

    @statechanged="playerStateChanged($event)"
    @ready="playerReadied"-->
</template>

<script>

  export default {
    data() {
      return {
        playerOptions: {
          autoplay: false,
          controls: true,
          techOrder: ['flash'],
          flash: { hls: { withCredentials: false } },
          html5: { hls: { withCredentials: false } },
          live: true,
          sources: [{
            type: 'rtmp/mp4',
            src: 'rtmp://api.sb.im:1935/live/outdoor'
          }],
          poster: '/src/assets/images/header/logo.png'
        }
      }
    },
    props: {
      source: {
        type: String,
        required: true,
        default: ''
      }
    },
    created() {

    },
    components:{
      // 'video-player':videoPlayer
    },
    methods: {
      // record current time
      onTimeupdate(e) {
        console.log('currentTime', e.cache_.currentTime)
      }
    }
  }
</script>
