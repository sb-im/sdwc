<template>
  <monitor-img v-if="video&&video.point_type_name==='livestream_img'" :source="video.name"></monitor-img>
  <monitor-flv v-else-if="video&&video.point_type_name==='livestream_flv'" :source="video.name"></monitor-flv>
  <monitor-hls v-else-if="video&&video.point_type_name==='livestream_hls'" :source="video.name"></monitor-hls>
  <monitor-flash v-else-if="video&&video.point_type_name==='livestream_flash'" :source="video.name"></monitor-flash>
  <monitor-webrtc v-else-if="video&&video.point_type_name==='livestream_webrtc'" :source="video.name"></monitor-webrtc>
  <monitor-iframe v-else-if="video&&video.point_type_name==='iframe'" :source="video.name"></monitor-iframe>
  <div class="rt-monitor-tip-empty" v-else>{{ $t('common.no_video') }}</div>
</template>
<script>
  import MonitorImg from './monitor-img'
  import MonitorFlv from './monitor-flv'
  import MonitorHls from './monitor-hls'
  import MonitorFlash from './monitor-flash'
  import MonitorWebRTC from './monitor-webrtc.vue';
  import MonitorIframe from './monitor-iframe'

  export default {
    data() {
      return {}
    },
    props: {
      video: {
        type: Object,
        default: () => {}
      }
    },
    components: {
      'monitor-img': MonitorImg,
      'monitor-flv': MonitorFlv,
      'monitor-hls': MonitorHls,
      'monitor-flash': MonitorFlash,
      'monitor-webrtc': MonitorWebRTC,
      'monitor-iframe': MonitorIframe
    },
    created() {

    }
  }
</script>
<style>
  .rt-monitor-tip-empty {
    color: #fff;
    text-align: center;
    padding-top: 200px;
  }
</style>
