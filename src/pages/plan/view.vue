<template>
  <div class="plan__view">
    <sd-card icon="doc" title="plan.view.title">
      <template #action>
        <el-button type="primary" size="medium" icon="el-icon-edit" @click="handleEdit">
          <span v-t="'plan.edit.alter'"></span>
        </el-button>
        <el-button
          v-if="running"
          type="warning"
          size="medium"
          icon="el-icon-remove-outline"
          @click="handleStop"
        >
          <span v-t="'plan.view.stop'"></span>
        </el-button>
        <el-button
          v-else
          type="danger"
          size="medium"
          icon="el-icon-refresh"
          :loading="running === null"
          @click="handleRun"
        >
          <span v-t="'plan.view.run'"></span>
        </el-button>
      </template>
      <sd-plan-readonly :plan="plan"></sd-plan-readonly>
    </sd-card>
    <sd-map icon="map-waypoint" title="map.waypoint" fit v-bind="map"></sd-map>
    <sd-card class="plan__history" icon="paper-busy" title="plan.view.history" dense>
      <el-table
        stripe
        v-loading="log.loading"
        :data="logsToShow"
        :default-sort="{ prop: 'created_at', order: 'descending' }"
        @sort-change="handleSortChange"
      >
        <el-table-column
          align="center"
          prop="created_at"
          sortable="custom"
          :sort-orders="['ascending', 'descending']"
          :formatter="dateFormatter"
        >
          <span slot="header" class="cell" v-t="'plan.view.run_time'"></span>
        </el-table-column>
        <el-table-column align="center">
          <span slot="header" class="cell" v-t="'plan.view.raw_data'"></span>
          <template v-slot="{row}">
            <el-button
              type="primary"
              size="mini"
              :disabled="!row.raw_data"
              @click="handleDownload(row.raw_data, `${row.id}_raw_data.bin`)"
              v-t="'common.view'"
            ></el-button>
          </template>
        </el-table-column>
        <el-table-column align="center">
          <span slot="header" class="cell" v-t="'plan.view.auto_run'"></span>
          <template v-slot="{row}">
            <el-button
              type="primary"
              size="mini"
              :disabled="!row.orthomosaic_path"
              @click="handleDownload(row.orthomosaic_path, `${row.id}_orthomosaic.tif`)"
              v-t="'common.view'"
            ></el-button>
          </template>
        </el-table-column>
        <el-table-column align="center" border>
          <span slot="header" class="cell" v-t="'plan.view.logs'"></span>
          <template v-slot="{row}">
            <el-button
              icon="el-icon-download"
              size="mini"
              :disabled="!row.air_log_path"
              @click="handleDownload(row.air_log_path, `${row.id}_air_log.bin`)"
            >
              <span v-t="'common.download'"></span>
            </el-button>
          </template>
        </el-table-column>
        <el-table-column align="center">
          <span slot="header" class="cell" v-t="'plan.view.sever_logs'"></span>
          <template v-slot="{row}">
            <el-button
              icon="el-icon-download"
              size="mini"
              :disabled="!row.sever_log_path"
              @click="handleDownload(row.sever_log_path, `${row.id}_sever_log.bin`)"
            >
              <span v-t="'common.download'"></span>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        layout="total, prev, pager, next"
        :total="logs.length"
        :current-page.sync="pagination.current"
      ></el-pagination>
    </sd-card>
    <sd-preflight ref="preflight" :plan="plan" @run="handleRunComfirm"></sd-preflight>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import { getPlanMissionQueue, runPlan, stopPlan, planLogs } from '@/api/super-dock';

import Card from '@/components/card.vue';
import PlanMap from '@/components/map/map.vue';
import Preflight from '@/components/preflight/preflight.vue';
import PlanReadonly from '@/components/plan/readonly.vue';

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
      running: null,
      map: {
        path: [],
        markers: []
      },
      logs: [],
      log: {
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
    logsToShow() {
      const { size, current } = this.pagination;
      const end = current * size;
      return this.logs.slice(end - size, end);
    }
  },
  methods: {
    ...mapActions([
      'retrievePlan',
      'downloadFile',
      'getMapPath'
    ]),
    checkPlanRunning() {
      getPlanMissionQueue(this.plan.id)
        .then(queue => this.running = queue.length !== 0);
    },
    handleEdit() {
      this.$router.push({ name: 'plan/edit', params: { id: this.plan.id } });
    },
    handleRun() {
      this.$refs.preflight.toggle();
    },
    handleRunComfirm() {
      runPlan(this.plan.id).then(() => {
        this.$refs.preflight.setPlanRunStatus(0);
      }).catch(e => {
        this.$refs.preflight.setPlanRunStatus(1, e.status);
      }).then(this.checkPlanRunning);
    },
    handleStop() {
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
      stopPlan(this.plan.id).then(() => {
        n.$data.message = this.$t('plan.view.stop_run');
        n.$data.type = 'warning';
        n.$data.duration = 2000;
        n.startTimer();
      }).catch(e => {
        n.$data.type = 'error';
        n.$data.message = this.$t('plan.view.stop_fail', { code: e.status });
      }).then(this.checkPlanRunning);
    },
    sortPlanLogs(order = 'descending') {
      const modifier = order === 'descending' ? -1 : 1;
      this.logs.sort((a, b) => (a.created_at - b.created_at) * modifier);
    },
    async getPlanLogs() {
      this.log.loading = true;
      const raw = await planLogs(this.plan.id);
      raw.forEach(l => l.created_at = new Date(l.created_at));
      this.logs = raw;
      this.sortPlanLogs();
      this.log.loading = false;
    },
    handleSortChange({ order }) {
      this.log.order = order;
      this.pagination.current = 1;
      this.sortPlanLogs(order);
    },
    handleDownload(url, name) {
      this.downloadFile({ url, name: `plan_${this.plan.id}_${name}` });
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
    this.getPlanLogs();
    this.checkPlanRunning();
  },
  components: {
    [Card.name]: Card,
    [PlanMap.name]: PlanMap,
    [Preflight.name]: Preflight,
    [PlanReadonly.name]: PlanReadonly
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
