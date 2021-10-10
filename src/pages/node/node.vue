<template>
  <div class="node" v-loading="!selectedNode">
    <component v-if="selectedNode" :is="componentName" :node="selectedNode"></component>
  </div>
</template>

<script>
import Depot from '@/components/depot/depot.vue';
import Drone from '@/components/drone/drone.vue';

const ComponentName = {
  'air': Drone.name,
  'depot': Depot.name
};

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
    },
    /** @returns {string} */
    componentName() {
      return ComponentName[this.selectedNode.info.type_name];
    }
  },
  components: {
    [Depot.name]: Depot,
    [Drone.name]: Drone
  }
};
</script>
