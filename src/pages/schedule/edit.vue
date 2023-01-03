<template>
  <sd-card icon="doc-edit" title="plan.edit.edit">
    <template #action>
      <el-button type="success" size="medium" icon="el-icon-document-checked" @click="handleUpdate">
        <span v-t="'common.save'"></span>
      </el-button>
      <el-button type="danger" size="medium" icon="el-icon-delete" @click="handleDelete">
        <span v-t="'common.delete'"></span>
      </el-button>
      <el-button type="info" size="medium" icon="el-icon-close" @click="handleCancel">
        <span v-t="'common.cancel'"></span>
      </el-button>
    </template>
    <sd-schedule-detail ref="detail" :initial="schedule"></sd-schedule-detail>
  </sd-card>
</template>

<script>
import { mapActions } from 'vuex';

import Card from '@/components/card.vue';
import ScheduleDetail from '@/components/schedule/schedule-detail.vue';

export default {
  name: 'sd-schedule-edit',
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
    ...mapActions([
      'updateSchedule',
      'deleteSchedule'
    ]),
    handleUpdate() {
      const schedule = this.$refs.detail.getSchedule();
      this.updateSchedule(schedule)
        .then(() => this.$router.push({ name: 'schedule/view', params: { id: this.schedule.id } }))
        .catch(e => this.$message.error(this.$t('plan.edit.update_failed', { code: e.status })));
    },
    handleDelete() {
      this.$confirm(this.$t('plan.edit.delete_tips'), {
        title: this.$t('plan.edit.delete_title'),
        type: 'warning'
      })
        .then(() => this.deleteSchedule(this.scheduleId))
        .then(() => this.$router.push({ name: 'schedule/list' }))
        .catch(() => { /* noop */ });
    },
    handleCancel() {
      this.$router.back();
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
