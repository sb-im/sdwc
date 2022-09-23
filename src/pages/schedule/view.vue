<template>
  <sd-card icon="doc" title="schedule.view.title">
    <template #action>
      <el-button type="primary" size="medium" icon="el-icon-edit" @click="handleEdit">
        <span v-t="'common.edit'"></span>
      </el-button>
      <el-button type="danger" size="medium" icon="el-icon-refresh" @click="handleRun">
        <span v-t="'schedule.view.trigger'"></span>
      </el-button>
    </template>
    <sd-schedule-detail :initial="schedule" readonly></sd-schedule-detail>
  </sd-card>
</template>

<script>
import { triggerSchedule } from '@/api/super-dock-v3';

import Card from '@/components/card.vue';
import ScheduleDetail from '@/components/schedule/schedule-detail.vue';

export default {
  name: 'sd-schedule-view',
  props: {
    scheduleId: {
      type: Number,
      required: true
    }
  },
  computed: {
    /** @returns {ApiTypes.V3.Schedule[]} */
    schedules() { return this.$store.state.schedule; },
    /** @returns {ApiTypes.V3.Schedule} */
    schedule() {
      return this.schedules.find(s => s.id === this.scheduleId);
    },
  },
  methods: {
    handleEdit() {
      this.$router.push({ name: 'schedule/edit', params: { id: this.scheduleId } });
    },
    handleRun() {
      triggerSchedule(this.scheduleId)
        .then(() => {
          this.$message.success(this.$t('schedule.view.trigger_success'));
        })
        .catch(e => {
          this.$alert(e.error, {
            title: this.$t('plan.view.run_fail'),
            type: 'error'
          });
        });
    },
  },
  components: {
    [Card.name]: Card,
    [ScheduleDetail.name]: ScheduleDetail
  }
};
</script>

<style>
</style>
