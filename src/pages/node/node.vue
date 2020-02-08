<template>
  <component :is="componentName" :node="selectedNode"></component>
</template>

<script>
import { mapState } from 'vuex';

import Depot from '@/components/depot/depot.vue';
import Drone from '@/components/drone/drone.vue';
import Loading from './loading.vue';

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
    ...mapState([
      'node'
    ]),
    selectedNode() {
      return this.node.find(node => node.info.id === this.id);
    },
    componentName() {
      if (!this.selectedNode) return Loading.name;
      return ComponentName[this.selectedNode.info.type_name];
    }
  },
  components: {
    [Depot.name]: Depot,
    [Drone.name]: Drone,
    [Loading.name]: Loading
  }
};
</script>
