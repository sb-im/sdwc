<template>
  <div class="homepage-hero-module">
    <div class="login-container">
        <slot name="header"></slot>
    </div>
    <div class="video-container">
      <div :style="fixStyle" class="filter"></div>
      <video :style="fixStyle" autoplay loop class="fillWidth" v-on:canplay="canplay">
        <source :src=video type="video/mp4"/>
      </video>
      <div class="poster hidden" v-if="!vedioCanPlay">
        <img :style="fixStyle" :src=image alt="background">
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      vedioCanPlay: false,
      fixStyle: ''
    }
  },
  props: {
    video: {
      type: String,
      default: String
    },
    image: {
      type: String,
      default: String
    }
  },
  methods: {
    canplay() {
      this.vedioCanPlay = true
    }
  },
  mounted() {
    window.onresize = () => {
      const windowWidth = document.body.clientWidth
      const windowHeight = document.body.clientHeight
      const windowAspectRatio = windowHeight / windowWidth
      let videoWidth
      let videoHeight
      if (windowAspectRatio < 0.5625) {
        videoWidth = windowWidth
        videoHeight = videoWidth * 0.5625
        this.fixStyle = {
          height: windowWidth * 0.5625 + 'px',
          width: windowWidth + 'px',
          'margin-bottom': (windowHeight - videoHeight) / 2 + 'px',
          'margin-left': 'initial'
        }
      } else {
        videoHeight = windowHeight
        videoWidth = videoHeight / 0.5625
        this.fixStyle = {
          height: windowHeight + 'px',
          width: windowHeight / 0.5625 + 'px',
          'margin-left': (windowWidth - videoWidth) / 2 + 'px',
          'margin-bottom': 'initial'
        }
      }
    }
    window.onresize()
  }
}
</script>




<style scoped>
.homepage-hero-module,
.video-container {
  position: relative;
  height: 100vh;
  overflow: hidden;
}

.video-container .poster img,
.video-container video {
  z-index: -2;
  position: absolute;
}

.video-container .filter {
  z-index: -1;
  position: absolute;
  background: rgba(0, 0, 0, 0.4);
}

.login-container {
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
  width: 100%;
  position: absolute;
  z-index: 1;
  color: #fff;
}
</style>
