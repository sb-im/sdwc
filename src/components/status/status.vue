<template>
  <div
    class="status el-card sd-card"
    v-loading="statusCode !== 0"
    :element-loading-text="$t('status.disconnected')"
    element-loading-spinner="el-icon-warning"
    element-loading-custom-class="status--disconnected"
  >
    <sd-status-meter :items="items" v-on="$listeners">
      <slot name="popover" slot="popover"></slot>
    </sd-status-meter>
    <sd-status-notify :nodeId="nodeId" :notification="notification"></sd-status-notify>
  </div>
</template>

<script>
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
  components: {
    [Meter.name]: Meter,
    [Notify.name]: Notify
  }
};
</script>

<style>
.status__line {
  font-size: 14px;
  display: flex;
}
.status__line:not(:first-child) {
  border-top: 1px solid #ebeef5;
}

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
</style>
