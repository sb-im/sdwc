<template>
  <div>
    <div v-for="video in node.videos">
      <div v-if="video.type=='img'">
        <monitor-img :source="video.address"></monitor-img>
      </div>
      <div v-else>
        <monitor-flv :source="video.address"></monitor-flv>
      </div>
    </div>
    <webterminal :websocket=node.websocket :commands=command></webterminal>
  </div>
</template>
<script>
import MonitorImg from '../components/monitor-img.vue'
import MonitorFlv from '../components/monitor-flv.vue'
import WebTerminal from '../components/webterminal.vue'
import Command from '../components/air-command.json'


  export default {
    data() {
      return {
        command: Command
      }
    },
    props: {
      node: {
        type: Object,
        default: Object
      }
    },
    components: {
      'monitor-img': MonitorImg,
      'monitor-flv': MonitorFlv,
      'webterminal': WebTerminal
    }
  }
</script>
