<template>
  <div>
    <div v-for="video in node.video">
      <monitor-img :source="video"></monitor-img>
    </div>
  </div>
</template>
<script>
import MonitorImg from '../components/monitor-img.vue'


  export default {
    props: {
      node: {
        type: Object,
        default: Object
      }
    },
    components: {
      'monitor-img': MonitorImg
    }
  }
</script>
