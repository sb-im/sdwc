<template>
  <div class="plan__view">
    <sd-card icon="doc" :title="$t('plan.view.title')">
      <template #action>
        <el-button
          type="primary"
          size="medium"
          icon="el-icon-edit"
          @click="handleEdit"
        >{{ $t('plan.edit.alter') }}</el-button>
        <el-button
          v-if="running"
          type="warning"
          size="medium"
          icon="el-icon-remove-outline"
          @click="handleStop"
        >{{ $t('plan.view.stop') }}</el-button>
        <el-button
          v-else
          type="danger"
          size="medium"
          icon="el-icon-refresh"
          :loading="running === null"
          @click="handleRun"
        >{{ $t('plan.view.run') }}</el-button>
      </template>
      <sd-plan-readonly :plan="plan"></sd-plan-readonly>
    </sd-card>
    <sd-map :path="mapPath" :markers="mapMarkers" fit></sd-map>
    <sd-card class="plan__history" icon="paper-busy" :title="$t('plan.view.history')" dense>
      <el-table stripe :data="log" :default-sort="{ prop: 'created_at', order: 'descending' }">
        <el-table-column
          align="center"
          prop="created_at"
          sortable
          :label="$t('plan.view.run_time')"
          :formatter="dateFormatter"
        ></el-table-column>
        <el-table-column align="center" :label="$t('plan.view.raw_data')">
          <template v-slot="{row}">
            <el-button
              type="primary"
              size="mini"
              :disabled="!row.raw_data"
              @click="handleDownload(row.raw_data, `${row.id}_raw_data.bin`)"
            >{{ $t('common.view') }}</el-button>
          </template>
        </el-table-column>
        <el-table-column align="center" :label="$t('plan.view.auto_run')">
          <template v-slot="{row}">
            <el-button
              type="primary"
              size="mini"
              :disabled="!row.orthomosaic_path"
              @click="handleDownload(row.orthomosaic_path, `${row.id}_orthomosaic.tif`)"
            >{{ $t('common.view') }}</el-button>
          </template>
        </el-table-column>
        <el-table-column align="center" border :label="$t('plan.view.logs')">
          <template v-slot="{row}">
            <el-button
              icon="el-icon-download"
              size="mini"
              :disabled="!row.air_log_path"
              @click="handleDownload(row.air_log_path, `${row.id}_air_log.bin`)"
            >{{ $t('common.download') }}</el-button>
          </template>
        </el-table-column>
        <el-table-column align="center" :label="$t('plan.view.sever_logs')">
          <template v-slot="{row}">
            <el-button
              icon="el-icon-download"
              size="mini"
              :disabled="!row.sever_log_path"
              @click="handleDownload(row.sever_log_path, `${row.id}_sever_log.bin`)"
            >{{ $t('common.download') }}</el-button>
          </template>
        </el-table-column>
      </el-table>
    </sd-card>
    <sd-preflight ref="preflight" :plan="plan" @run="handleRunComfirm"></sd-preflight>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import { getPlanMissionQueue, runPlan, stopPlan } from '@/api/super-dock';

import Card from '@/components/card.vue';
import PlanMap from '@/components/map/map.vue';
import Preflight from '@/components/preflight.vue';
import PlanReadonly from '@/components/plan/readonly.vue';

export default {
  name: 'sd-plan-view',
  props: {
    plan: {
      type: Object,
      required: true
    },
    log: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      running: null,
      mapPath: [],
      mapMarkers: []
    };
  },
  methods: {
    ...mapActions([
      'retrievePlan',
      'getPlanLogs',
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
      this.$refs.preflight.setPlanRunStatus(2);
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
    handleDownload(url, name) {
      this.downloadFile({ url, name: `plan_${this.plan.id}_${name}` });
    },
    dateFormatter(row, column, cellValue /*, index */) {
      return this.$d(new Date(cellValue), 'long');
    }
  },
  mounted() {
    this.retrievePlan(this.plan.id)
      .then(plan => this.getMapPath(plan.map_path))
      .then(r => {
        this.mapPath = r.path;
        this.mapMarkers = r.actions;
      });
    this.getPlanLogs(this.plan.id);
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
