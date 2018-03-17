<template>
  <div>
    <div v-for="video in node.videos">
      <rt-monitor :video="video"></rt-monitor>
    </div>
    <webterminal :autolf=true :commands=command></webterminal>
  </div>
</template>
<script>
import Monitor from '../components/rt-monitor/rt-monitor.vue'
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
      'rt-monitor': Monitor,
      'webterminal': WebTerminal
    }
  }
</script>
