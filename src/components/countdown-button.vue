<template>
  <el-button v-bind="$attrs">
    <slot></slot>
    {{confirmSuffix}}
  </el-button>
</template>

<script>
export default {
  inheritAttrs: false,
  name: 'sd-countdown-button',
  props: {
    count: {
      type: Number,
      default: 5
    },
    delay: {
      type: Number,
      default: 1000
    }
  },
  data() {
    return {
      remain: 0,
      interval: -1
    };
  },
  computed: {
    confirmSuffix() {
      return this.remain > 0 ? ` (${this.remain})` : '';
    }
  },
  methods: {
    countDown() {
      this.remain = this.count;
      this.interval = setInterval(() => {
        this.remain--;
        if (this.remain <= 0) {
          clearInterval(this.interval);
          this.interval = -1;
        }
      }, this.delay);
    }
  }
};
</script>
