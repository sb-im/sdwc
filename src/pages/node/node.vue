<template>
  <component :is="componentName" v-bind="componentProps"></component>
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
    /** @returns {import('@/store/modules/node').Node} */
    selectedNode() {
      return this.node.find(node => node.info.id === this.id);
    },
    componentName() {
      if (!this.selectedNode) return Loading.name;
      return ComponentName[this.selectedNode.info.type_name];
    },
    componentProps() {
      if (!this.selectedNode) return {};
      return {
        node: this.selectedNode.info,
        status: this.selectedNode.status,
        msg: this.selectedNode.msg,
        log: this.selectedNode.log,
        position: this.selectedNode.position,
        path: this.selectedNode.path
      };
    }
  },
  components: {
    [Depot.name]: Depot,
    [Drone.name]: Drone,
    [Loading.name]: Loading
  }
};
</script>
