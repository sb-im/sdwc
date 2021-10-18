<template>
  <div class="embedded" :class="className" v-loading="!selectedNode">
    <component v-if="selectedNode" :is="componentName" :node="bindNode" v-bind="$attrs"></component>
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
  name: 'sd-embedded',
  inheritAttrs: false,
  props: {
    node: {
      type: Number,
      required: true
    },
    point: {
      type: String,
      required: true
    },
    header: {
      type: String,
      default: ''
    }
  },
  computed: {
    /** @returns {{ [key: string]: boolean }} */
    className() {
      return {
        'embedded--hide-header': this.header === 'hide'
      };
    },
    /** @returns {SDWC.Node} */
    selectedNode() {
      return this.$store.state.node.find(node => node.info.id === this.node);
    },
    /** @returns {string} */
    componentName() {
      return ComponentName[this.selectedNode.info.type_name];
    },
    /** @returns {SDWC.NodePoint} */
    selectedPoint() {
      return this.selectedNode.info.points.find(p =>
        p.id == this.point ||
        p.point_type_id == this.point ||
        p.point_type_name == this.point ||
        p.point_type_name.startsWith(this.point)
      );
    },
    /** @returns {SDWC.Node} */
    bindNode() {
      const { info, msg, status, network } = this.selectedNode;
      return {
        info: { ...info, points: [this.selectedPoint], },
        msg, status, network
      };
    }
  },
  components: {
    [Depot.name]: Depot,
    [Drone.name]: Drone
  }
};
</script>

<style>
.embedded {
  width: 100vw;
  height: 100vh;
}
.embedded .drone,
.embedded .depot {
  display: block;
  width: 100%;
  height: 100%;
}
.embedded .drone .el-card,
.embedded .depot .el-card {
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 0;
  margin: 0;
}
.embedded .el-card__body {
  height: calc(100% - 73px);
}
/* hide card header */
.embedded--hide-header .el-card__header {
  display: none;
}
.embedded--hide-header .el-card__body {
  height: 100%;
}
/* map */
.embedded .map__el {
  height: 100%;
}
/* monitor */
.embedded .monitor__content {
  height: 100%;
}
</style>
