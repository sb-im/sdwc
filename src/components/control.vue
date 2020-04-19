<template>
  <sd-card class="control" icon="compass" title="control.title">
    <div
      class="control__body"
      v-loading="disabled"
      element-loading-custom-class="control--disable"
      element-loading-spinner="el-icon-warning-outline"
      :element-loading-text="disabledText"
    >
      <div class="control__group control__buttons" v-for="group in controls" :key="group.icon">
        <sd-icon :value="group.icon" :size="36"></sd-icon>
        <div v-for="ctl in group.item" :key="ctl.name">
          <el-button
            size="medium"
            :type="ctl.type || 'warning'"
            :disabled="pending[ctl.mission]"
            v-loading="pending[ctl.mission]"
            @click="handleControl(ctl)"
            v-t="{ path: ctl.name, args: ctl.values }"
          ></el-button>
        </div>
      </div>
    </div>
  </sd-card>
</template>

<script>
import Card from '@/components/card.vue';
import Icon from '@/components/sd-icon.vue';

/**
 * custom control group
 * @type {{ icon: string, item: SDWC.ControlButton[] }[]}
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
      type: Object,
      required: true
    }
  },
  data() {
    return {
      pending: {}
    };
  },
  computed: {
    disabled() {
      return this.status.code !== 0;
    },
    disabledText() {
      return this.$t('control.abnormal');
    },
    controls() {
      return Controls;
    }
  },
  methods: {
    /**
     * @param {SDWC.ControlItem} ctl
     */
    handleControl(ctl) {
      this.$set(this.pending, ctl.mission, true);
      this.$mqtt(this.point.node_id, ctl)
        .catch(() => { /* noop */ })
        .then(() => this.$set(this.pending, ctl.mission, false));
    }
  },
  mounted() {
    for (const group of this.controls) {
      for (const item of group.item) {
        this.$set(this.pending, item.mission, false);
      }
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
  user-select: none;
}
.control__group {
  margin-right: 16px;
  height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
}
.control--disable {
  transition: opacity 0s;
  cursor: not-allowed;
}
.control__buttons .el-button {
  position: relative;
}
.control__buttons .el-button.is-disabled {
  border-color: transparent;
}
.control__buttons .el-button.el-loading-parent--relative {
  overflow: hidden;
}
.control__buttons .el-button .el-loading-mask {
  background-color: rgba(255, 255, 255, 0.55);
}
.control__buttons .el-button circle {
  r: 10;
  animation-name: loading-dash--small;
}
.control__buttons .el-button--danger circle {
  stroke: #f56c6c;
}
.control__buttons .el-button--warning circle {
  stroke: #e6a23c;
}
.control__buttons .el-button--primary circle {
  stroke: #409eff;
}
.control__buttons .el-button--success circle {
  stroke: #67c23a;
}
.control__buttons .el-button--info circle {
  stroke: #909399;
}
@keyframes loading-dash--small {
  0% {
    stroke-dasharray: 1, 100;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 45, 75;
    stroke-dashoffset: -20px;
  }
  100% {
    stroke-dasharray: 45, 75;
    stroke-dashoffset: -60px;
  }
}
</style>
