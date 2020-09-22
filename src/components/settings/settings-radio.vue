<template>
  <el-radio-group size="mini" v-model="model" :disabled="disabled" @change="handleChange">
    <el-radio-button v-for="v in values" :key="v" :label="v"></el-radio-button>
  </el-radio-group>
</template>

<script>
export default {
  name: 'sd-settings-radio',
  props: {
    label: {
      type: String,
      required: true
    },
    disabled: {
      type: Boolean,
      default: false
    },
    values: {
      type: Array,
      required: true
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
      this.model = null;
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
