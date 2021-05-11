<template>
  <div class="plan">
    <div class="el-card sd-card term">
      <sd-status-notify :notification="termOutput" :canPopup="false"></sd-status-notify>
    </div>
    <sd-card icon="doc" title="plan.view.title">
      <template #action>
        <el-button type="primary" size="medium" icon="el-icon-edit" @click="handleEdit">
          <span v-t="'common.edit'"></span>
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
      <sd-plan-readonly :plan="planToShow"></sd-plan-readonly>
    </sd-card>
    <sd-map icon="map-waypoint" title="map.waypoint" fit v-bind="map"></sd-map>
    <sd-job-file ref="jobFile"></sd-job-file>
    <sd-card class="plan__history" icon="paper-busy" title="plan.view.history" dense>
      <el-table
        stripe
        v-loading="job.loading"
        :data="jobsToShow"
        :row-class-name="getTableRowClass"
        :default-sort="{ prop: 'created_at', order: 'descending' }"
        @sort-change="handleSortChange"
      >
        <el-table-column
          align="center"
          width="170"
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
            <template v-for="(blobId, name) of row.files">
              <el-button :key="name" size="mini" @click="handleOpenFile(blobId)">{{ name }}</el-button>
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
import JobFile from '@/components/job-file/job-file.vue';

import { MutationTypes as PLAN } from '@/store/modules/plan';

import { waypointsToMapProps } from './common';

export default {
  name: 'sd-plan-view',
  props: {
    /** @type {import('vue').PropOptions<SDWC.PlanInfo>}*/
    plan: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      map: {},
      /** @type {SDWC.PlanJob[]} */
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
      /**
       * @param {SDWC.State} state
       * @returns {SDWC.PlanTermOutput[]}
       */
      termOutput(state) {
        const term = state.plan.term.find(t => t.id === this.plan.id);
        return term ? term.output : [];
      },
      /**
       * @param {SDWC.State} state
       * @returns {SDWC.PlanRunningContent}
       */
      runningContent(state) {
        /** @type {SDWC.PlanRunning} */
        const running = state.plan.running.find(r => r.id === this.plan.id);
        return running ? running.running : null;
      }
    }),
    isRunning() {
      return this.runningContent !== null;
    },
    planToShow() {
      if (!this.isRunning) return this.plan;
      return Object.assign({}, this.plan, {
        files: Object.assign({}, this.plan.files, this.runningContent.files),
        extra: Object.assign({}, this.plan.extra, this.runningContent.extra)
      });
    },
    jobsToShow() {
      const { size, current } = this.pagination;
      const end = current * size;
      return this.jobs.slice(end - size, end);
    }
  },
  methods: {
    ...mapActions([
      'getPlanWaypoints'
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
      cancelPlanJob(this.plan.id, this.runningContent.id).then(() => {
        Object.assign(n.$data, {
          message: this.$t('plan.view.stop_run'),
          type: 'warning',
          duration: 2000
        });
        n.startTimer();
      }).catch(e => {
        Object.assign(n.$data, {
          message: this.$t('plan.view.stop_fail', { code: e.status }),
          type: 'error'
        });
      });
    },
    sortJobs(order = 'descending') {
      const modifier = order === 'descending' ? -1 : 1;
      this.jobs.sort((a, b) => (a.created_at - b.created_at) * modifier);
    },
    async getPlanJobs() {
      this.job.loading = true;
      const res = await getPlanJobs(this.plan.id);
      if (this.isRunning) {
        this.patchRunningJob(res, this.runningContent.job);
      }
      res.forEach(l => l.created_at = new Date(l.created_at));
      this.jobs = res;
      this.sortJobs();
      this.job.loading = false;
    },
    /**
     * @param {SDWC.PlanJob[]} jobs
     * @param {SDWC.PlanRunningContentJob} runningJob
     */
    patchRunningJob(jobs, runningJob) {
      if (!runningJob || !runningJob.job_id) return;
      /** @type {SDWC.PlanJob} */
      const job = jobs.find(j => j.job_id === runningJob.job_id);
      if (typeof job !== 'object') {
        const now = new Date();
        jobs.unshift(Object.assign({
          temporary: true,
          id: runningJob.job_id,
          plan_id: this.plan.id,
          created_at: now,
          updated_at: now
        }, runningJob));
      } else {
        if (job.temporary) {
          job.files = runningJob.files;
          job.extra = runningJob.extra;
        } else {
          job.files = Object.assign({}, job.files, runningJob.files);
          job.extra = Object.assign({}, job.extra, runningJob.extra);
        }
      }
    },
    /**
     * @param {{ row: SDWC.PlanJob }} _
     * @returns {string}
     */
    getTableRowClass({ row }) {
      if (!this.isRunning) return '';
      return this.runningContent.job.job_id === row.job_id ? 'is-running' : '';
    },
    handleSortChange({ order }) {
      this.job.order = order;
      this.pagination.current = 1;
      this.sortJobs(order);
    },
    handleOpenFile(blobId) {
      this.$refs.jobFile.open(blobId);
    },
    dateFormatter(row, column, cellValue /*, index */) {
      return this.$d(cellValue, 'long');
    }
  },
  created() {
    this.getPlanWaypoints(this.plan).then(wp => this.map = waypointsToMapProps(wp));
    this.getPlanJobs();
    this._unsub = this.$store.subscribe(({ type, payload }) => {
      if (type === PLAN.SET_PLAN_RUNNING) {
        if (payload.id === this.plan.id && payload.running.job) {
          this.patchRunningJob(this.jobs, payload.running.job);
        }
      }
    });
  },
  beforeDestroy() {
    if (typeof this._unsub === 'function') this._unsub();
  },
  components: {
    [Card.name]: Card,
    [PlanMap.name]: PlanMap,
    [PlanReadonly.name]: PlanReadonly,
    [StatusNotify.name]: StatusNotify,
    [JobFile.name]: JobFile
  }
};
</script>

<style>
.plan__history .el-table__body-wrapper {
  min-height: 400px;
}
.plan__history .el-table td {
  padding: 0;
  height: 40px;
}
.plan__history .el-table .el-button--mini {
  padding: 6px 10px;
}
.plan__history .el-pagination {
  padding: 8px 25px;
}

.plan__history .el-table__row.is-running > td {
  background-image: repeating-linear-gradient(45deg, #00000015, #00000015 10px, transparent 10px, transparent 20px) !important;
}
</style>
