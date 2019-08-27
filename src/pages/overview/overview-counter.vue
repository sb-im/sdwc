<template>
  <el-card class="sd-overview-counter" shadow="never" :style="{ backgroundColor: backgroundColor }">
    <sd-icon :value="icon" :size="48"></sd-icon>
    <div class="overview-counter__text">
      <div class="overview-counter__caption">{{caption}}</div>
      <div class="overview-counter__value">{{value}}</div>
    </div>
  </el-card>
</template>

<script>
import Icon from '@/components/sd-icon.vue';

export default {
  name: 'sd-overview-counter',
  props: {
    icon: {
      type: String,
      required: true
    },
    caption: {
      type: String,
      required: true
    },
    value: {
      type: [String, Number],
      required: true
    },
    backgroundColor: {
      type: String,
      required: true
    }
  },
  components: {
    [Icon.name]: Icon
  }
};
</script>

<style>
.sd-overview-counter {
  flex-grow: 1;
  border: 1px solid #ececec;
}
.sd-overview-counter:not(:first-child) {
  margin-left: 10px;
}
.sd-overview-counter .el-card__body {
  display: flex;
}
.overview-counter__text {
  margin-left: 20px;
  flex-grow: 1;
  text-align: center;
}
.overview-counter__caption {
  font-size: 18px;
}
.overview-counter__value {
  font-weight: bold;
}
</style>
