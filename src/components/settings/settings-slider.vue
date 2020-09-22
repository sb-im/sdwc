<template>
  <el-slider
    class="settings__slider"
    :disabled="disabled"
    :min="range[0]"
    :max="range[1]"
    :step="step"
    v-model="model"
    @change="handleChange"
  ></el-slider>
</template>

<script>
export default {
  name: 'sd-settings-slider',
  props: {
    label: {
      type: String,
      required: true
    },
    disabled: {
      type: Boolean,
      default: false
    },
    range: {
      type: Array,
      required: true
    },
    step: {
      type: Number,
      default: 1
    },
    value: {
      type: Number,
      default: 0
    }
  },
  data: () => ({
    model: null
  }),
  methods: {
    handleChange(val) {
      this.$emit('change', val);
    }
  },
  watch: {
    value(newVal) {
      this.model = newVal;
    }
  },
  created() {
    this.model = this.value;
  }
};
</script>

<style>
.settings__slider {
  width: 160px;
}
</style>
