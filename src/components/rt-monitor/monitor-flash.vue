<template>
  <div id="StrobeMediaPlayer"></div>
</template>

<script>
  export default {
    data() {
      return {
        player: null,
        originTime: null,
        timeoutTimer: null,
        mediaTimeout: 2000,
        delayTolerance: 1000,
        playerConfig: {
          src: this.source,
          width: 750,
          height: 428,
          autoPlay: true,  // start playing the media after page load
          initialBufferTime : 0,  // buffer to fill before play begins
          expandedBufferTime : this.delayTolerance / 1000,  // maximum buffer size
          minContinuousPlayback : 0,  // minimum playback time without pausing
          liveBufferTime: 0,  // buffer time for live content
          streamType: 'live',
          scaleMode: 'none', // don't scale the video width and height
          verbose: true,  // display detailed error messages for debugging
          // javascriptCallbackFunction: this.onPlayerEvent
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
    mounted() {
      swfobject.embedSWF(
        '/static/strobe/StrobeMediaPlayback.swf',
        'StrobeMediaPlayer',
        750, 428, '10.1.0', 'expressInstall.swf',
        this.playerConfig, {
          allowFullScreen: 'true', wmode: 'opaque'
        },{
          name:'StrobeMediaPlayer'
        });
    },
    components:{
      // 'video-player':videoPlayer
    },
    methods: {
      onPlayerEvent(playerId, eventName, eventObj) {
        if (this.player === null) this.player = document.getElementById(playerId);
        if (eventName === 'timeupdate') {
          if (isNaN(eventObj.currentTime) || eventObj.currentTime === 0) return false;

          let currentMediaTime = eventObj.currentTime * 1000,
            now = new Date().getTime();
          if (this.originTime === null) {
            this.originTime = now - currentMediaTime;
          }
          let projectedMediaTime = now - this.originTime,
            mediadTimeDiff = projectedMediaTime - currentMediaTime;
          if (mediadTimeDiff > this.delayTolerance) {
            this.player.pause();
            this.player.play2();
          } else if (mediadTimeDiff < 0) {
            this.originTime = now - currentMediaTime;
          }
          this.scheduleMediaTimeout();
        } else if (eventName === 'play') {
          this.cancelMediaTimeout();
          this.originTime = null;
        }
      },
      scheduleMediaTimeout() {
        this.cancelMediaTimeout();
        this.timeoutTimer = setTimeout(this.onMediaTimeout,this.mediaTimeout);
      },
      cancelMediaTimeout() {
        this.timeoutTimer !== null && clearTimeout(this.timeoutTimer);
      },
      onMediaTimeout() {
        if (this.player.getState() === 'paused') return false;
        this.player.pause();
        this.player.play2();
      }
    }
  }
</script>
