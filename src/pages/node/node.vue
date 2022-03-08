<template>
  <div class="node" v-loading="!selectedNode">
    <sd-node-drone v-if="selectedNode" :node="selectedNode" />
  </div>
</template>

<script>
// TODO: merge depot and drone
import Depot from '@/components/depot/depot.vue';
import Drone from '@/components/drone/drone.vue';

export default {
  name: 'sd-node',
  props: {
    id: {
      type: Number,
      required: true
    }
  },
  computed: {
    /** @returns {SDWC.Node} */
    selectedNode() {
      return this.$store.state.node.find(node => node.info.id === this.id);
    }
  },
  components: {
    [Depot.name]: Depot,
    [Drone.name]: Drone
  }
};
</script>
