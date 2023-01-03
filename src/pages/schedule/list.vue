<template>
  <div class="schedule">
    <sd-card class="schedule-list" icon="new-view" title="schedule.list.list" dense>
      <template #action>
        <el-button type="success" size="medium" icon="el-icon-plus" @click="handleNew">
          <span v-t="'schedule.edit.new'"></span>
        </el-button>
      </template>
      <el-table
        stripe
        :data="tableData"
        :height="tableHeight"
        :default-sort="{ prop: 'updated', order: 'descending' }"
      >
        <el-table-column>
          <template #header>
            <span v-t="'plan.name'"></span>
          </template>
          <template v-slot="{ row }">
            <router-link :to="{ name: 'schedule/view', params: { id: row.id } }" v-slot="{ href }">
              <!-- eslint-disable vue/no-v-text-v-html-on-component -->
              <el-link v-text="row.name" :href="href"></el-link>
            </router-link>
          </template>
        </el-table-column>
        <el-table-column prop="updated" :formatter="dateFormatter" sortable>
          <template #header>
            <span v-t="'plan.list.updated'"></span>
          </template>
        </el-table-column>
        <el-table-column prop="enable" :formatter="dateFormatter" sortable>
          <template #header>
            <span v-t="'schedule.state'"></span>
          </template>
          <template v-slot="{ row }">
            <el-link v-if="row.enabled" :underline="false" icon="el-icon-success" type="primary">
              <span v-t="'schedule.enabled'"></span>
            </el-link>
            <el-link v-else :underline="false" icon="el-icon-info">
              <span v-t="'schedule.disabled'"></span>
            </el-link>
          </template>
        </el-table-column>
      </el-table>
    </sd-card>
  </div>
</template>

<script>
import throttle from 'lodash/throttle';

import Card from '@/components/card.vue';

/**
 * @typedef {{ id: number, name: string, updated: Date, enabled: boolean }} ScheduleItem
 */

export default {
  name: 'sd-schedule-list',
  data: () => ({
    tableHeight: 500,
  }),
  computed: {
    /** @returns {ApiTypes.V3.Schedule[]} */
    schedules() { return this.$store.state.schedule; },
    /** @returns {ScheduleItem[]} */
    tableData() {
      return this.schedules.map(s => ({
        id: s.id,
        name: s.name,
        updated: new Date(s.updated_at),
        enabled: s.enable
      }));
    }
  },
  methods: {
    handleNew() {
      this.$router.push({ name: 'schedule/new' });
    },
    /**
     * @param {ScheduleItem} row
     */
    dateFormatter(row) {
      return this.$d(row.updated, 'long');
    }
  },
  beforeMount() {
    const fn = () => {
      this.tableHeight = window.innerHeight - 155;
    };
    fn();
    this.resizeListener = throttle(fn, 300);
    window.addEventListener('resize', this.resizeListener, { passive: true });
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resizeListener);
  },
  components: {
    [Card.name]: Card
  }
};
</script>

<style>
.schedule-list {
  height: 100%;
  margin: 0;
}
/* make table row tighter */
.schedule-list .el-table__cell {
  padding: 5px 0;
}
</style>
