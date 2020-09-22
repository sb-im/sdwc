<template>
  <el-switch :value="value" :disabled="disabled" @change="handleChange"></el-switch>
</template>

<script>
export default {
  name: 'sd-settings-switch',
  props: {
    label: {
      type: String,
      required: true
    },
    disabled: {
      type: Boolean,
      default: false
    },
    value: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    handleChange(val) {
      this.$emit('change', val);
    }
  }
};
</script>
