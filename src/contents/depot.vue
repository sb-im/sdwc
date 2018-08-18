<template>
  <div>
    <weather></weather>
    <div v-for="video in node.videos">
      <rt-monitor :video="video"></rt-monitor>
    </div>
    <webterminal :websocket=node.websocket :autolf=true :commands=command></webterminal>
  </div>
</template>
<script>
import Monitor from '../components/rt-monitor/rt-monitor.vue'
import Terminal from '../components/webterminal/httpTerminal.vue'
import Command from '../components/depot-command.json'
import Weather from '../components/weather.vue'


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
      'weather': Weather,
      'webterminal': Terminal
    }
  }
</script>
