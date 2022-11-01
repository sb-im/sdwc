<template>
  <div>
    <el-form-item>
      <span slot="label" v-t="'common.plan'"></span>
      <el-select v-model="schedulePlan">
        <el-option
          v-for="plan in plans"
          :key="plan.info.id"
          :label="plan.info.name"
          :value="plan.info.id"
        ></el-option>
      </el-select>
    </el-form-item>
    <el-form-item>
      <span slot="label" v-t="'schedule.cron'"></span>
      <el-input
        class="schedule--mono"
        :readonly="readonly"
        :value="value.cron"
        @change="emitUpdate('cron', $event)"
      ></el-input>
    </el-form-item>
  </div>
</template>

<script>
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
    }
  },
  data: () => ({
  }),
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
