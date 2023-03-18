<template>
  <div class="schedule">
    <sd-card icon="doc-add" title="schedule.edit.new">
      <template #action>
        <el-button
          type="success"
          size="medium"
          icon="el-icon-document-checked"
          @click="handleCreate"
        >
          <span v-t="'common.save'"></span>
        </el-button>
        <el-button type="info" size="medium" icon="el-icon-close" @click="handleCancel">
          <span v-t="'common.cancel'"></span>
        </el-button>
      </template>
      <sd-schedule-detail ref="detail" :initial="schedule"></sd-schedule-detail>
    </sd-card>
  </div>
</template>

<script>
import { mapActions } from 'vuex';

import Card from '@/components/card.vue';
import ScheduleDetail from '@/components/schedule/schedule-detail.vue';

export default {
  name: 'sd-schedule-new',
  data: () => ({
    /** @type {ApiTypes.V3.Schedule} */
    schedule: {
      name: '',
      enable: true,
      cron: '',
      task_id: '',
    }
  }),
  methods: {
    ...mapActions([
      'createSchedule'
    ]),
    handleCreate() {
      const schedule = this.$refs.detail.getSchedule();
      this.createSchedule(schedule)
        .then(p => this.$router.push({ name: 'schedule/view', params: { id: p.id } }))
        .catch(e => this.$message.error(this.$t('plan.edit.create_failed', { code: e.status })));
    },
    handleCancel() {
      this.$router.push({ name: 'schedule/list' });
    }
  },
  components: {
    [Card.name]: Card,
    [ScheduleDetail.name]: ScheduleDetail
  }
};
</script>

<style>
</style>
