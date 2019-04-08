<template>
  <component :is="componentName" v-bind="componentProps"></component>
</template>

<script>
import { mapState } from 'vuex';

import Icon from '@/components/sd-icon.vue';
import Depot from '@/components/depot/depot.vue';
import Drone from '@/components/drone/drone.vue';
import Loading from './loading.vue';

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
      if (this.selectedNode) {
        switch (this.selectedNode.type_name) {
          case 'air': return Drone.name;
          case 'depot': return Depot.name;
        }
      }
      return Loading.name;
    },
    componentProps() {
      if (!this.selectedNode) return {};
      return {
        node: this.selectedNode,
        status: this.node.status.find(n => n.id === this.id).status,
        message: this.node.message.find(n => n.id === this.id).msg
      };
    }
  },
  components: {
    [Icon.name]: Icon,
    [Depot.name]: Depot,
    [Drone.name]: Drone,
    [Loading.name]: Loading
  }
};
</script>

<style>
.sd-node-card__head {
  display: flex;
  align-items: center;
}
.sd-node-card__title {
  margin-left: 8px;
  font-weight: bold;
  font-size: 1.1rem;
}
.sd-node-card__action {
  margin-left: auto;
}
</style>
