<template>
  <el-button v-bind="$attrs" v-on="$listeners" :disabled="disabled" ref="button">
    <span v-t="text"></span>
    <span>{{confirmSuffix}}</span>
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
    },
    mode: {
      type: String,
      default: '',
      validator(v) {
        return ['delay', 'timeout'].includes(v);
      }
    },
    text: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      remain: 0,
      interval: -1
    };
  },
  computed: {
    disabled() {
      return this.mode === 'delay' && this.remain > 0;
    },
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
          if (this.mode === 'timeout') {
            this.$emit('click');
          }
        }
      }, this.delay);
    }
  }
};
</script>
