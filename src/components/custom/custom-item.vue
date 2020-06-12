<template>
  <el-form-item>
    <span slot="label" v-t="label"></span>
    <el-input readonly :value="value">
      <template v-if="unit" #append>
        <span v-text="unit"></span>
      </template>
    </el-input>
  </el-form-item>
</template>

<script>
export default {
  name: 'sd-node-custom-item',
  props: {
    label: {
      type: String,
      required: true
    },
    value: {
      default: ''
    },
    unit: {
      type: String
    }
  }
};
</script>
