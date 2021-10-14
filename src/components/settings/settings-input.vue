<template>
  <el-input
    class="settings__input"
    v-model="model"
    :disabled="disabled"
    @change="handleChange"
  >
    <template v-if="unit" #append>{{ unit }}</template>
  </el-input>
</template>

<script>
export default {
  name: 'sd-settings-input',
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
      type: [String, Number],
      default: ''
    },
    unit: {
      type: String
    }
  },
  data: () => ({
    model: null
  }),
  methods: {
    handleChange(val) {
      if (typeof this.value === 'number') {
        val = Number.parseFloat(val);
      }
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
.settings__input .el-input__inner {
  padding: 0 0 0 10px;
}
.settings__input .el-input-group__append {
  padding: 0 10px;
}
</style>
