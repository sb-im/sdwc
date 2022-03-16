<template>
  <div class="embedded" :class="className" v-loading="!selectedNode">
    <sd-node v-if="selectedNode" :id="node" :point="selectedPoint" v-bind="$attrs"></sd-node>
  </div>
</template>

<script>
import Node from '@/pages/node/node.vue';

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
    /** @returns {SDWC.NodePoint} */
    selectedPoint() {
      return this.selectedNode.info.points.find(p =>
        p.id == this.point ||
        p.point_type_id == this.point ||
        p.point_type_name == this.point ||
        p.point_type_name.startsWith(this.point)
      );
    },
  },
  components: {
    [Node.name]: Node
  }
};
</script>

<style>
.embedded {
  width: 100vw;
  height: 100vh;
}
.embedded .node {
  display: block;
  width: 100%;
  height: 100%;
}
.embedded .node .el-card {
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
