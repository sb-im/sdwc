<template>
  <div v-if="video.video_type_name=='img'">
    <monitor-img :source="video.address"></monitor-img>
  </div>
  <div v-else-if="video.video_type_name=='flv'">
    <monitor-flv :source="video.address"></monitor-flv>
  </div>
  <div v-else-if="video.video_type_name=='hls'">
    <monitor-hls :source="video.address"></monitor-hls>
  </div>
  <div v-else>
    <h1>404 not find type</h1>
  </div>
</template>
<script>
import MonitorImg from './monitor-img.vue'
import MonitorFlv from './monitor-flv.vue'
import MonitorHls from './monitor-hls.vue'


  export default {
    data() {
      return {}
    },
    props: {
      video: {
        type: Object,
        default: Object
      }
    },
    components: {
      'monitor-img': MonitorImg,
      'monitor-flv': MonitorFlv,
      'monitor-hls': MonitorHls
    }
  }
</script>
