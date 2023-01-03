<template>
  <div>
    <el-form-item>
      <span slot="label" v-t="'common.plan'"></span>
      <template v-if="readonly">
        <router-link v-if="planRoute" :to="planRoute" v-slot="{ href }">
          <a class="plan__node" :href="href">
            <el-input :value="planName" readonly></el-input>
          </a>
        </router-link>
        <el-input v-else :value="planName" :placeholder="$t('common.none')" readonly></el-input>
      </template>
      <el-select v-else v-model="schedulePlan">
        <el-option
          v-for="plan in plans"
          :key="plan.info.id"
          :label="plan.info.name"
          :value="plan.info.id"
        ></el-option>
      </el-select>
    </el-form-item>
    <el-form-item>
      <span slot="label" v-t="'schedule.strategy'"></span>
      <ele-vue-cron
        class="schedule__cron"
        :value="value.cron"
        :disabled="readonly"
        @change="handleCronChange"
      ></ele-vue-cron>
    </el-form-item>
  </div>
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
  computed: {
    /** @returns {SDWC.PlanState[]} */
    plans() { return this.$store.state.plan; },
    /** @type {Vue.ComputedOptions<number>} */
    schedulePlan: {
      get() {
        if (this.value.method !== 'taskRun') return null;
        const taskId = Number.parseInt(this.value.params.trim().replace(/^"id"=\s*/, ''), 10);
        return Number.isNaN(taskId) ? null : taskId;
      },
      set(newValue) {
        this.$emit('input', {
          ...this.value,
          method: 'taskRun',
          params: `"id"=${newValue}`
        });
      }
    },
    /** @returns {import('vue-router').Route} */
    planRoute() {
      if (this.schedulePlan !== null) {
        return { name: 'plan', params: { id: this.schedulePlan } };
      }
      return null;
    },
    /** @returns {string} */
    planName() {
      return this.plans.find(p => p.info.id === this.schedulePlan)?.info.name ?? '';
    }
  },
  data: () => ({
  }),
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
