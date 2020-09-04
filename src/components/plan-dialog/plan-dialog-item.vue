<template>
  <div class="sd-plan-dialog__item">
    <sd-icon v-if="icon" :value="icon" :size="30"></sd-icon>
    <div class="sd-plan-dialog__detail">
      <div class="sd-plan-dialog__title" v-t="title"></div>
      <slot></slot>
    </div>
    <i class="sd-plan-dialog__icon" :class="iconClass"></i>
  </div>
</template>

<script>
import Icon from '@/components/sd-icon.vue';
import { getLevelIconClass } from '@/constants/level-icon-class';

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
    iconClass() {
      if (typeof this.level === 'string') return getLevelIconClass(this.level);
      return '';
    }
  },
  components: {
    [Icon.name]: Icon
  }
};
</script>

<style>
.sd-plan-dialog__item {
  margin: 10px 0;
  display: flex;
}
.sd-plan-dialog__detail {
  flex-grow: 1;
  padding: 0 8px;
  white-space: pre-wrap;
}
.sd-plan-dialog__title {
  font-size: 18px;
  line-height: 30px;
  font-weight: bold;
}
.sd-plan-dialog__icon {
  line-height: 30px;
  font-size: 24px;
}
</style>
