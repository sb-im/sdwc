<template>
  <div class="el-card is-never-shadow sd-card" :class="className">
    <div class="el-card__header sd-card__head">
      <sd-icon :value="icon" :size="36"></sd-icon>
      <span class="sd-card__title" v-t="title"></span>
      <div class="sd-card__action">
        <slot name="action"></slot>
      </div>
    </div>
    <div class="el-card__body">
      <slot></slot>
    </div>
  </div>
</template>

<script>
import Icon from '@/components/sd-icon.vue';

export default {
  name: 'sd-card',
  props: {
    icon: {
      type: String,
      required: false
    },
    title: {
      type: String,
      required: false
    },
    dense: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  computed: {
    className() {
      return {
        'sd-card--dense': this.dense
      };
    }
  },
  components: {
    [Icon.name]: Icon
  }
};
</script>

<style>
.sd-card {
  margin-bottom: 10px;
}
.sd-card__head {
  display: flex;
  align-items: center;
  user-select: none;
}
.sd-card__title {
  margin-left: 8px;
  font-weight: bold;
  font-size: 1.1rem;
}
.sd-card__action {
  margin-left: auto;
}
.sd-card--dense .el-card__body {
  padding: 0;
}
</style>
