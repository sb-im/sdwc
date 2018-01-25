<template>
  <div>
    <div v-for="video in node.video">
      <monitor-img :source="video"></monitor-img>
    </div>
    <webterminal :websocket=node.websocket :autolf=false></webterminal>
  </div>
</template>
<script>
import MonitorImg from '../components/monitor-img.vue'
import WebTerminal from '../components/webterminal.vue'


  export default {
    props: {
      node: {
        type: Object,
        default: Object
      }
    },
    components: {
      'monitor-img': MonitorImg,
      'webterminal': WebTerminal
    }
  }
</script>
