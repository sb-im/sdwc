<template>
  <div v-if="video.type=='img'">
    <monitor-img :source="video.address"></monitor-img>
  </div>
  <div v-else-if="video.type=='flv'">
    <monitor-flv :source="video.address"></monitor-flv>
  </div>
  <div v-else>
    <h1>404 not find type</h1>
  </div>
</template>
<script>
import MonitorImg from './monitor-img.vue'
import MonitorFlv from './monitor-flv.vue'


  export default {
    data() {
      return {}
    },
    props: {
      video: {
        type: Object,
        default: {}
      }
    },
    components: {
      'monitor-img': MonitorImg,
      'monitor-flv': MonitorFlv
    }
  }
</script>
