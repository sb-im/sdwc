<template>
  <el-input
    class="settings__input"
    size="mini"
    v-model="model"
    :disabled="disabled"
    @change="handleChange"
  ></el-input>
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
      type: String,
      default: ''
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
.settings__input {
  width: 100px;
}
.settings__input .el-input__inner {
  padding: 0 0 0 10px;
}
</style>
