<template>
  <sd-card class="control" icon="compass" :title="$t('common.advanced_control')">
    <div
      class="control__body"
      v-loading="disabled"
      element-loading-spinner="el-icon-warning-outline"
      :element-loading-text="$t('common.not_operational')"
    >
      <div class="control__group" v-for="group in controls" :key="group.icon">
        <sd-icon :value="group.icon" :size="36"></sd-icon>
        <div v-for="ctl in group.item" :key="ctl.name">
          <el-button
            size="medium"
            :type="ctl.type || 'warning'"
            @click="handleControl(ctl)"
          >{{ $t(ctl.name, ctl.values) }}</el-button>
        </div>
      </div>
    </div>
  </sd-card>
</template>

<script>
import Card from '@/components/card.vue';
import Icon from '@/components/sd-icon.vue';

/**
 * @typedef {import('element-ui/types/button').ButtonType} ButtonType
 * @typedef {import('@/index').SDWC.ControlItem} ControlItem
 * custom control group
 * @type {{ icon: string, item: ControlItem[] }[]}
 */
const Controls = [
  {
    icon: 'reset',
    item: [
      { name: 'depot.emergency_stop', mission: 'stop', type: 'danger' },
      { name: 'depot.air_reset', mission: 'reset' }
    ]
  }
];

export default {
  name: 'sd-node-control',
  props: {
    point: {
      type: Object,
      required: true
    },
    status: {
      type: Number,
      required: true
    }
  },
  computed: {
    disabled() {
      return this.status !== 0;
    },
    controls() {
      return Controls;
    }
  },
  methods: {
    /**
     * @param {ControlItem} ctl
     */
    handleControl(ctl) {
      this.$mqtt(this.point.node_id, ctl).catch(() => { /* noop */ });
    }
  },
  components: {
    [Card.name]: Card,
    [Icon.name]: Icon
  }
};
</script>

<style>
.control__body {
  display: flex;
  flex-wrap: wrap;
}
.control__group {
  margin-right: 16px;
  height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
}
.control__body .el-loading-mask {
  transition: opacity 0s;
  user-select: none;
  cursor: not-allowed;
}
</style>
