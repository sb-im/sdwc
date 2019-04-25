<template>
  <div class="drone">
    <sd-node-drone-status :node="node" :message="message"></sd-node-drone-status>
    <sd-node-drone-control :node="node" :status="status"></sd-node-drone-control>
  </div>
</template>

<script>
import Status from './status.vue';
import Control from './control.vue';

export default {
  name: 'sd-node-drone',
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
    [Status.name]: Status,
    [Control.name]: Control
  }
};
</script>
