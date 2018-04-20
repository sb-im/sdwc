<template>
  <div>
    <div v-for="video in node.videos">
      <rt-monitor :video="video"></rt-monitor>
    </div>
    <webterminal :websocket=node.websocket :commands=command></webterminal>
  </div>
</template>
<script>
import Monitor from '../components/rt-monitor/rt-monitor.vue'
import WebTerminal from '../components/webterminal/webterminal.vue'
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
      'rt-monitor': Monitor,
      'webterminal': WebTerminal
    }
  }
</script>
