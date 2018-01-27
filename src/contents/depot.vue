<template>
  <div>
    <div v-for="video in node.videos">
      <monitor-img :source="video.address"></monitor-img>
    </div>
    <webterminal :autolf=false :commands=command></webterminal>
  </div>
</template>
<script>
import MonitorImg from '../components/monitor-img.vue'
import WebTerminal from '../components/webterminal.vue'
import Command from '../components/depot-command.json'


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
      'webterminal': WebTerminal
    }
  }
</script>
