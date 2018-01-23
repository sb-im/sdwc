<template>
  <div v-if="node.type == 'air'">
    <sd-air :node="node"></sd-air>
  </div>
  <div v-else-if="node.type == 'depot'">
    <sd-depot :node="node"></sd-depot>
  </div>
  <div v-else>
    <h1>404</h1>
  </div>
</template>
<script>
import Depot from '../contents/depot.vue'
import Air from '../contents/air.vue'


  export default {
    props: {
      node: {
        type: Object,
        default: Object
      }
    },
    components: {
      'sd-depot': Depot,
      'sd-air': Air
    }
  }
</script>
