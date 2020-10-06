<template>
  <div class="plan">
    <div class="el-card sd-card term">
      <sd-status-notify :notification="termOutput" :canPopup="false"></sd-status-notify>
    </div>
    <sd-card icon="doc" title="plan.view.title">
      <template #action>
        <el-button type="primary" size="medium" icon="el-icon-edit" @click="handleEdit">
          <span v-t="'plan.edit.alter'"></span>
        </el-button>
        <el-button
          v-if="isRunning"
          type="warning"
          size="medium"
          icon="el-icon-remove-outline"
          @click="handleStop"
        >
          <span v-t="'plan.view.stop'"></span>
        </el-button>
        <el-button v-else type="danger" size="medium" icon="el-icon-refresh" @click="handleRun">
          <span v-t="'plan.view.run'"></span>
        </el-button>
      </template>
      <sd-plan-readonly :plan="plan"></sd-plan-readonly>
    </sd-card>
    <sd-map icon="map-waypoint" title="map.waypoint" fit v-bind="map"></sd-map>
    <sd-card class="plan__history" icon="paper-busy" title="plan.view.history" dense>
      <el-table
        stripe
        v-loading="job.loading"
        :data="jobsToShow"
        :default-sort="{ prop: 'created_at', order: 'descending' }"
        @sort-change="handleSortChange"
      >
        <el-table-column
          align="center"
          width="200"
          prop="created_at"
          sortable="custom"
          :sort-orders="['ascending', 'descending']"
          :formatter="dateFormatter"
        >
          <span slot="header" v-t="'plan.view.run_time'"></span>
        </el-table-column>
        <el-table-column>
          <span slot="header" v-t="'plan.view.raw_data'"></span>
          <template v-slot="{ row }">
            <template v-for="(url, name) of row.files">
              <el-button
                :key="name"
                size="mini"
                icon="el-icon-download"
                @click="handleDownload(url, name, job)"
              >{{ name }}</el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        layout="total, prev, pager, next"
        :total="jobs.length"
        :current-page.sync="pagination.current"
      ></el-pagination>
    </sd-card>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import { runPlanJob, getPlanJobs, cancelPlanJob } from '@/api/super-dock';

import Card from '@/components/card.vue';
import PlanMap from '@/components/map/map.vue';
import PlanReadonly from '@/components/plan/readonly.vue';
import StatusNotify from '@/components/status/status-notify.vue';

export default {
  name: 'sd-plan-view',
  props: {
    plan: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      map: {
        path: [],
        markers: []
      },
      jobs: [],
      job: {
        loading: false,
        order: 'descending'
      },
      pagination: {
        size: 10,
        current: 1
      }
    };
  },
  computed: {
    ...mapState({
      termOutput(state) {
        const t = state.plan.term.find(t => t.id === this.plan.id) || { output: [] };
        return t.output;
      },
      runningJob(state) {
        const s = state.plan.running.find(s => s.id === this.plan.id);
        return s ? s.job : null;
      }
    }),
    isRunning() {
      return Boolean(this.runningJob);
    },
    jobsToShow() {
      const { size, current } = this.pagination;
      const end = current * size;
      return this.jobs.slice(end - size, end);
    }
  },
  methods: {
    ...mapActions([
      'retrievePlan',
      'downloadFile',
      'getMapPath'
    ]),
    handleEdit() {
      this.$router.push({ name: 'plan/edit', params: { id: this.plan.id } });
    },
    handleRun() {
      runPlanJob(this.plan.id).catch(() => { /* noop */ });
    },
    handleStop() {
      if (!this.isRunning) return;
      /**
       * mutate element-ui's Notification object
       * @see https://github.com/ElemeFE/element/blob/v2.8.2/packages/notification/src/main.vue
       */
      const n = this.$notify({
        offset: 50,
        duration: 0,
        type: 'info',
        title: this.plan.name,
        message: this.$t('plan.view.pending'),
      });
      cancelPlanJob(this.plan.id, this.runningJob.id).then(() => {
        n.$data.message = this.$t('plan.view.stop_run');
        n.$data.type = 'warning';
        n.$data.duration = 2000;
        n.startTimer();
      }).catch(e => {
        n.$data.type = 'error';
        n.$data.message = this.$t('plan.view.stop_fail', { code: e.status });
      });
    },
    sortJobs(order = 'descending') {
      const modifier = order === 'descending' ? -1 : 1;
      this.jobs.sort((a, b) => (a.created_at - b.created_at) * modifier);
    },
    async getPlanJobs() {
      this.job.loading = true;
      const res = await getPlanJobs(this.plan.id);
      res.forEach(l => l.created_at = new Date(l.created_at));
      this.jobs = res;
      this.sortJobs();
      this.job.loading = false;
    },
    handleSortChange({ order }) {
      this.job.order = order;
      this.pagination.current = 1;
      this.sortJobs(order);
    },
    /**
     * @param {string} url
     * @param {string} name
     * @param {SDWC.PlanJob} job
     */
    handleDownload(url, name, job) {
      this.downloadFile({ url, name: `plan_${job.plan_id}-job_${job.job_id}-${name}` });
    },
    dateFormatter(row, column, cellValue /*, index */) {
      return this.$d(cellValue, 'long');
    }
  },
  created() {
    this.retrievePlan(this.plan.id)
      .then(plan => this.getMapPath(plan.map_path))
      .then(r => {
        this.map.path = r.path;
        this.map.markers = r.actions;
      });
    this.getPlanJobs();
  },
  components: {
    [Card.name]: Card,
    [PlanMap.name]: PlanMap,
    [PlanReadonly.name]: PlanReadonly,
    [StatusNotify.name]: StatusNotify
  }
};
</script>

<style>
.plan__view .el-table__body-wrapper {
  min-height: 390px;
}
.plan__view .el-table td {
  padding: 6px 0;
}
.plan__view .el-table .el-button--mini {
  padding: 6px 10px;
}
.plan__view .el-pagination {
  padding: 8px 25px;
}
</style>
