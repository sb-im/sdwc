<template>
  <div class="depot">
    <sd-node-depot-control :node="node" :status="status"></sd-node-depot-control>
  </div>
</template>

<script>
import Control from './control.vue';

export default {
  name: 'sd-node-depot',
  props: {
    node: {
      type: Object,
      required: true
    },
    status: {
      type: Number,
      required: true
    },
    message: {
      type: Array,
      required: true
    },
    log : {
      type: Array,
      required: true
    }
  },
  components: {
    [Control.name]: Control
  }
};
</script>

<style>
</style>
