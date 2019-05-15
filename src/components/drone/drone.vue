<template>
  <div class="drone">
    <sd-node-drone-status :node="node" :message="message"></sd-node-drone-status>
    <sd-map :path="mapPath"></sd-map>
    <sd-node-drone-control :node="node" :status="status"></sd-node-drone-control>
  </div>
</template>

<script>
import Status from './status.vue';
import Control from './control.vue';
import NodeMap from '@/components/map/map.vue';

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
    log: {
      type: Array,
      required: true
    }
  },
  computed: {
    mapPath() {
      return this.message.map(msg => {
        const { lat, lon: lng } = msg.status.gps;
        return { lat, lng };
      });
    }
  },
  components: {
    [Status.name]: Status,
    [Control.name]: Control,
    [NodeMap.name]: NodeMap
  }
};
</script>
