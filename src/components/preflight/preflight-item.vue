<template>
  <div class="sd-preflight__item" v-loading="loading">
    <sd-icon v-if="icon" :value="icon" :size="30"></sd-icon>
    <div class="sd-preflight__detail">
      <div class="sd-preflight__title" v-t="title"></div>
      <div v-if="node">{{ node.info.name }} {{ $t(`common.status.${status}`) }}</div>
      <slot></slot>
    </div>
    <i class="sd-preflight__icon" :class="iconClass"></i>
  </div>
</template>

<script>
import Icon from '@/components/sd-icon.vue';
import { getNodeStatusClass } from '@/constants/node-status-class';
import { getLevelIconClass } from '@/constants/level-icon-class';

export default {
  name: 'sd-preflight-item',
  props: {
    icon: {
      type: String
    },
    title: {
      type: String,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    },
    status: {
      type: Number
    },
    level: {
      type: String
    },
    node: {
      type: Object
    }
  },
  computed: {
    iconClass() {
      if (typeof this.status === 'number') return getNodeStatusClass(this.status);
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
.sd-preflight__item {
  margin: 10px 0;
  display: flex;
}
.sd-preflight__detail {
  flex-grow: 1;
  padding: 0 8px;
  white-space: pre-wrap;
}
.sd-preflight__title {
  font-size: 18px;
  line-height: 30px;
  font-weight: bold;
}
.sd-preflight__subitem--warning,
.sd-preflight__subitem--danger {
  margin: -1px 0;
  border-style: solid;
  border-width: 1px 0;
}
.sd-preflight__subitem--warning {
  color: #e6a23c;
  border-color: #faecd8;
  background-color: #fdf6ec;
}
.sd-preflight__subitem--danger {
  color: #f56c6c;
  border-color: #fde2e2;
  background-color: #fef0f0;
}
.sd-preflight__icon {
  line-height: 30px;
  font-size: 24px;
}
</style>
