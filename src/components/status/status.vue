<template>
  <div class="status el-card sd-card">
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
</style>
