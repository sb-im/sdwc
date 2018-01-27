<template>
  <div>
    <div v-for="video in node.video">
      <monitor-img :source="video"></monitor-img>
      <monitor-flv :source="video"></monitor-flv>
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
