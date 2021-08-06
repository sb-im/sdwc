<template>
  <div
    class="status el-card sd-card"
    v-loading="statusCode !== 0"
    :element-loading-text="$t('status.disconnected')"
    element-loading-spinner="el-icon-warning"
    element-loading-custom-class="status--disconnected"
  >
    <sd-status-meter :items="items" v-on="$listeners">
      <template #append v-if="parameterPoint">
        <el-tooltip placement="bottom" :content="$t('status.parameters')">
          <el-button
            circle
            size="small"
            icon="el-icon-s-tools"
            class="status__parameters"
            :disabled="statusCode !== 0"
            @click="$refs.parameters.open()"
          ></el-button>
        </el-tooltip>
        <sd-node-parameters ref="parameters" :point="parameterPoint" :statusCode="statusCode"></sd-node-parameters>
      </template>
      <template #popover>
        <slot name="popover"></slot>
      </template>
    </sd-status-meter>
    <sd-status-notify :nodeId="nodeId" :notification="notification"></sd-status-notify>
  </div>
</template>

<script>
import NodeParameters from '@/components/settings/node-parameters.vue';

import Meter from './status-meter.vue';
import Notify from './status-notify.vue';

export default {
  inheritAttrs: false,
  name: 'sd-status',
  props: {
    items: {
      type: Array,
      required: true
    },
    nodeId: {
      type: Number,
      required: true
    },
    statusCode: {
      type: Number,
      required: true
    },
    notification: {
      type: Array,
      required: true
    }
  },
  computed: {
    parameterPoint() {
      const node = this.$store.state.node.find(n => n.info.id === this.nodeId);
      if (!node) return null;
      const point = node.info.points.find(p => p.point_type_name === 'parameter');
      return point;
    }
  },
  components: {
    [Meter.name]: Meter,
    [Notify.name]: Notify,
    [NodeParameters.name]: NodeParameters
  }
};
</script>

<style>
.status--disconnected {
  background-color: #00000020;
  transition: opacity 0s;
  pointer-events: none;
}
.status--disconnected .el-loading-spinner i {
  color: #f56c6c;
}
.status--disconnected .el-loading-text {
  color: unset;
}

.status__parameters {
  margin-right: 10px;
}
</style>
