<template>
  <el-form-item>
    <span slot="label" v-t="'schedule.cron'"></span>
    <el-input
      class="schedule--mono"
      :readonly="readonly"
      :value="value.cron"
      @input="emitUpdate('cron', $event)"
    ></el-input>
  </el-form-item>
</template>

<script>
export default {
  name: 'sd-schedule-edit-advanced',
  props: {
    readonly: {
      type: Boolean,
      default: false
    },
    /** @type {Vue.PropOptions<ApiTypes.V3.Schedule>} */
    value: {
      type: Object,
      required: true
    }
  },
  methods: {
    emitUpdate(key, val) {
      this.$emit('input', { ...this.value, [key]: val });
    }
  },
  created() {
    this.schedule = Object.assign({}, this.value);
  }
};
</script>

<style>
</style>
