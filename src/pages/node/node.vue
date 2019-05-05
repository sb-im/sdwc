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
    ...mapState({
      node: state => state.node
    }),
    selectedNode() {
      return this.node.info.find(n => n.id === this.id);
    },
    componentName() {
      if (!this.selectedNode) return Loading.name;
      return ComponentName[this.selectedNode.type_name];
    },
    componentProps() {
      if (!this.selectedNode) return {};
      return {
        node: this.selectedNode,
        status: this.node.status.find(n => n.id === this.id).status,
        message: this.node.message.find(n => n.id === this.id).msg,
        log: this.node.log.find(n => n.id === this.id).log
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
