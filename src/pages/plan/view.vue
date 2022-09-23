<template>
  <div class="plan">
    <!--
    <div class="el-card sd-card term">
      <sd-status-notify :notification="plan.term" :canPopup="false"></sd-status-notify>
    </div>
    -->
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
      <sd-plan-readonly :plan="plan.info"></sd-plan-readonly>
    </sd-card>
    <sd-map icon="map-waypoint" title="map.waypoint" fit fitType="all" v-bind="map"></sd-map>
    <sd-job-file ref="jobFile"></sd-job-file>
    <sd-card class="plan__history" icon="paper-busy" title="plan.view.history" dense>
      <el-table
        stripe
        v-loading="job.loading"
        :data="jobs"
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
        :total="job.total"
        :current-page.sync="job.page"
        @current-change="refreshShownJobs"
      ></el-pagination>
    </sd-card>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import { runTask, cancelTask } from '@/api/super-dock-v3';

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
    planId: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      map: {
        /** @type {SDWC.LatLng[]} */
        boundary: [],
        /** @type {SDWC.MapPolyline[]} */
        polylines: [],
        /** @type {SDWC.MarkerBase[]} */
        markers: []
      },
      /** @type {SDWC.PlanJob[]} */
      jobs: [],
      job: {
        loading: false,
        total: null,
        page: 1,
        order: 'descending'
      }
    };
  },
  computed: {
    /** @returns {SDWC.Node[]} */
    depots() { return this.$store.getters.depots; },
    /** @returns {SDWC.PlanState[]} */
    plans() { return this.$store.state.plan; },
    /** @returns {SDWC.PlanState} */
    plan() {
      return this.plans.find(p => p.info.id === this.planId);
    },
    /** @returns {boolean} */
    isRunning() {
      return this.plan.running !== null;
    },
    /** @returns {SDWC.MarkerDepot[]} */
    depotMarker() {
      return this.depots.filter(d => d.info.id === this.plan.info.node_id).map(d => ({
        type: 'depot',
        id: d.info.id,
        name: d.info.name,
        position: { lng: d.status.status.lng, lat: d.status.status.lat }
      }));
    }
  },
  methods: {
    ...mapActions([
      'getTaskJobs',
      'getPlanWaypoints'
    ]),
    handleEdit() {
      this.$router.push({ name: 'plan/edit', params: { id: this.planId } });
    },
    handleRun() {
      runTask(this.planId)
        .catch(e => {
          this.$alert(e.error, {
            title: this.$t('plan.view.run_fail'),
            type: 'error'
          });
        })
        .then(() => this.refreshShownJobs());
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
        title: this.plan.info.name,
        message: this.$t('plan.view.pending'),
      });
      cancelTask(this.planId).then(() => {
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
    async refreshPlanWaypoints() {
      try {
        const wp = await this.getPlanWaypoints(this.plan.info);
        const map = waypointsToMapProps(wp);
        map.markers.push(...this.depotMarker);
        this.map = map;
      } catch (e) { /* ignore */ }
    },
    async refreshShownJobs() {
      this.job.loading = true;
      const res = await this.getTaskJobs({ id: this.planId, page: this.job.page });
      if (this.isRunning) {
        this.patchRunningJob(res, this.plan.running.job);
      }
      this.jobs = res;
      this.job.total = this.plan.info.index;
      this.job.loading = false;
    },
    /**
     * @param {SDWC.PlanJob[]} jobs
     * @param {SDWC.PlanJob} runningJob
     */
    patchRunningJob(jobs, runningJob) {
      if (!runningJob?.id) return;
      /** @type {SDWC.PlanJob} */
      const job = jobs.find(j => j.id === runningJob.id);
      if (!job) return;
      job.files = Object.assign({}, job.files, runningJob.files);
      job.extra = Object.assign({}, job.extra, runningJob.extra);
    },
    /**
     * @param {{ row: SDWC.PlanJob }} _
     * @returns {string}
     */
    getTableRowClass({ row }) {
      if (!this.isRunning) return '';
      return this.plan.running.job.id === row.id ? 'is-running' : '';
    },
    handleSortChange({ order }) {
      this.job.order = order;
      this.job.page = 1;
      // TODO: refetch jobs
    },
    handleOpenFile(blobId) {
      this.$refs.jobFile.open(blobId);
    },
    dateFormatter(row, column, cellValue /*, index */) {
      return this.$d(new Date(cellValue), 'long');
    }
  },
  watch: {
    // sometimes waypoints loaded before node info (eg. page refresh)
    // append depot marker if there's none
    depotMarker(val) {
      if (this.map.markers.findIndex(m => m.type === 'depot') >= 0) return;
      this.map.markers.push(...val);
    }
  },
  created() {
    this.refreshPlanWaypoints();
    this.refreshShownJobs();
    this._unsub = this.$store.subscribe(({ type, payload }) => {
      if (type === PLAN.SET_PLAN_RUNNING) {
        if (payload.id === this.planId && payload.running.job) {
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

.plan__history .el-table__row.is-running {
  background-image: repeating-linear-gradient(45deg, #00000015, #00000015 10px, transparent 10px, transparent 20px);
}
.plan__history .el-table__row.is-running:hover .el-table__cell,
.plan__history .el-table__row.is-running.el-table__row--striped .el-table__cell {
  background-color: transparent;
}
</style>
