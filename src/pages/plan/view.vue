<template>
  <div class="plan__view">
    <sd-card icon="task/t_view" :title="$t('plan.view.title')">
      <template #action>
        <el-button
          type="primary"
          size="medium"
          icon="el-icon-edit"
          @click="handleEdit"
        >{{ $t('plan.edit.alter') }}</el-button>
        <el-button
          type="warning"
          size="medium"
          icon="el-icon-remove-outline"
          @click="handleStop"
        >{{ $t('plan.view.stop') }}</el-button>
        <el-button
          type="danger"
          size="medium"
          icon="el-icon-refresh"
          @click="handleRun"
        >{{ $t('plan.view.run') }}</el-button>
      </template>
      <sd-plan-readonly :plan="plan"></sd-plan-readonly>
    </sd-card>
    <sd-map :path="mapPath" fit></sd-map>
    <sd-card icon="task/t_history" :title="$t('plan.view.history')" dense>
      <el-table stripe :data="log">
        <el-table-column align="center" :label="$t('plan.view.run_time')">
          <template v-slot="{row}">{{ $d(new Date(row.created_at), 'long') }}</template>
        </el-table-column>
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
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import { runPlan, stopPlan } from '@/api/super-dock';

import Card from '@/components/card.vue';
import PlanMap from '@/components/map/map.vue';
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
      mapPath: []
    };
  },
  computed: {
    ...mapGetters([
      'depots',
      'drones'
    ]),
    droneName() {
      const drone = this.drones.find(d => d.id === this.plan.node_id);
      if (drone) return drone.name;
      return '';
    },
    depotName() {
      const depot = this.depots.find(d => d.id === this.plan.depot_id);
      if (depot) return depot.name;
      return '';
    },
    cycleTypeName() {
      return this.$t(`plan.edit.cycle_type_${this.plan.cycle_types_id + 1}`);
    }
  },
  methods: {
    ...mapActions([
      'retrievePlan',
      'getPlanLogs',
      'downloadFile',
      'getMapPath'
    ]),
    handleEdit() {
      this.$router.push({ name: 'plan/edit', params: { id: this.plan.id } });
    },
    handleRun() {
      runPlan(this.plan.id).then(() => {
        this.$notify({
          type: 'success',
          title: this.plan.name,
          message: this.$t('plan.view.start_run'),
        });
      });
    },
    handleStop() {
      stopPlan(this.plan.id).then(() => {
        this.$notify({
          type: 'warning',
          title: this.plan.name,
          message: this.$t('plan.view.stop_run'),
        });
      });
    },
    handleDownload(url, name) {
      this.downloadFile({ url, name: `plan_${this.plan.id}_${name}` });
    }
  },
  created() {
    this.retrievePlan(this.plan.id)
      .then(plan => this.getMapPath(plan.map_path))
      .then(path => this.mapPath = path);
    this.getPlanLogs(this.plan.id);
  },
  components: {
    [Card.name]: Card,
    [PlanMap.name]: PlanMap,
    [PlanReadonly.name]: PlanReadonly
  }
};
</script>
