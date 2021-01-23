<template>
  <div class="sd-plan-dialog__item" :class="levelClass">
    <sd-icon v-if="icon" :value="icon" :size="30"></sd-icon>
    <div class="sd-plan-dialog__detail">
      <div class="sd-plan-dialog__title" v-t="title"></div>
      <slot></slot>
    </div>
    <div class="sd-plan-dialog__level">
      <i class="sd-plan-dialog__icon" :class="iconClass"></i>
    </div>
  </div>
</template>

<script>
import Icon from '@/components/sd-icon.vue';

import { PlanDialogLevelClass } from '@/constants/plan-dialog-level-class';

const LevelColorClass = {
  warning: 'level--warning',
  danger: 'level--danger'
};

export default {
  name: 'sd-plan-dialog-item',
  props: {
    icon: {
      type: String
    },
    title: {
      type: String,
      required: true
    },
    level: {
      type: String
    }
  },
  computed: {
    levelClass() {
      return LevelColorClass[this.level] || '';
    },
    iconClass() {
      return PlanDialogLevelClass[this.level] || PlanDialogLevelClass.unknown;
    }
  },
  components: {
    [Icon.name]: Icon
  }
};
</script>

<style>
.sd-plan-dialog__item {
  margin: 6px 0;
  padding: 2px 8px;
  display: flex;
  border-radius: 4px;
}
.sd-plan-dialog__detail {
  flex-grow: 1;
  white-space: pre-wrap;
}
.sd-plan-dialog__title {
  font-size: 18px;
  line-height: 30px;
  font-weight: bold;
}
.sd-plan-dialog__level {
  display: flex;
  align-items: center;
}
.sd-plan-dialog__icon {
  font-size: 24px;
}
.sd-plan-dialog__item.level--warning {
  color: #e6a23c;
  background-color: #fdf6ec;
}
.sd-plan-dialog__item.level--danger {
  color: #f56c6c;
  background-color: #fef0f0;
}
</style>
