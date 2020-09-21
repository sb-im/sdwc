<template>
  <el-switch :value="value" @change="handleChange"></el-switch>
</template>

<script>
export default {
  name: 'sd-settings-switch',
  props: {
    label: {
      type: String,
      required: true
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
