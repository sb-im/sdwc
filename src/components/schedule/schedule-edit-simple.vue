<template>
  <el-form-item>
    <span slot="label" v-t="'schedule.strategy'"></span>
    <ele-vue-cron
      class="schedule__cron"
      :value="value.cron"
      :disabled="readonly"
      @change="handleCronChange"
    ></ele-vue-cron>
  </el-form-item>
</template>

<script>
import cronParser from 'cron-parser';
import EleVueCron from 'ele-vue-cron/packages/Cron/core/index.vue';

export default {
  name: 'sd-schedule-edit-simple',
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
    },
    /** @param {{ cron: string, period: string}} val */
    handleCronChange(val) {
      if (this.readonly) return;
      let cron = val.cron;
      // remove dayOfWeek constrain if period type is not 'week'
      if (val.period !== 'week') {
        const interval = cronParser.parseExpression(val.cron);
        cron = cronParser.fieldsToExpression({
          ...interval.fields,
          dayOfWeek: [0, 1, 2, 3, 4, 5, 6, 7]
        }).stringify();
      }
      this.$emit('input', { ...this.value, cron: cron });
    }
  },
  components: {
    /** @type {Vue.Component} */
    'ele-vue-cron': EleVueCron
  }
};
</script>

<style>
/* ele-vue-cron does not support 'readonly', try to make 'disabled' looks like 'readonly'  */
.schedule__cron .el-input.is-disabled .el-input__inner {
  background-color: white;
  border-color: #dcdfe6;
  color: #606266;
  cursor: text;
}
.schedule__cron .el-input.is-disabled .el-input__suffix {
  display: none;
}
</style>
