<template>
  <monitor-img v-if="video.point_type_name==='livestream_img'" :source="video.name"></monitor-img>
  <monitor-flv v-else-if="video.point_type_name==='livestream_flv'" :source="video.name"></monitor-flv>
  <monitor-hls v-else-if="video.point_type_name==='livestream_hls'" :source="video.name"></monitor-hls>
  <monitor-flash v-else-if="video.point_type_name==='livestream_flash'" :source="video.name"></monitor-flash>
  <monitor-iframe v-else-if="video.point_type_name==='iframe'" :source="video.name"></monitor-iframe>
</template>
<script>
import MonitorImg from './monitor-img'
import MonitorFlv from './monitor-flv'
import MonitorHls from './monitor-hls'
import MonitorFlash from './monitor-flash'
import MonitorIframe from './monitor-iframe'


  export default {
    data() {
      return {}
    },
    props: {
      video: {
        type: Object,
        required: true,
        default: () => {}
      }
    },
    components: {
      'monitor-img': MonitorImg,
      'monitor-flv': MonitorFlv,
      'monitor-hls': MonitorHls,
      'monitor-flash': MonitorFlash,
      'monitor-iframe': MonitorIframe
    },
    created() {
      console.log(this.video)
    }
  }
</script>
