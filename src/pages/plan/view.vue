<template>
  <div class="plan__view">
    <el-card shadow="never">
      <template #header>
        <div class="sd-node-card__head">
          <sd-icon value="task/t_view"></sd-icon>
          <span class="sd-node-card__title">{{ $t('plan.view.title') }}</span>
          <div class="sd-node-card__action">
            <el-button
              type="primary"
              size="medium"
              icon="el-icon-edit"
              @click="handleEdit"
            >{{ $t('plan.edit.alter') }}</el-button>
            <el-button
              type="danger"
              size="medium"
              icon="el-icon-refresh"
            >{{ $t('plan.view.run') }}</el-button>
          </div>
        </div>
      </template>
      <sd-plan-readonly :plan="plan"></sd-plan-readonly>
    </el-card>
    <el-card shadow="never" body-style="padding: 0">
      <template #header>
        <div class="sd-node-card__head">
          <sd-icon value="task/t_history"></sd-icon>
          <span class="sd-node-card__title">{{ $t('plan.view.history') }}</span>
        </div>
      </template>
      <el-table :data="log">
        <el-table-column
          align="center"
          prop="created_at"
          :label="$t('plan.view.run_time')"
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
    </el-card>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import Icon from '@/components/sd-icon.vue';
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
      'downloadFile'
    ]),
    handleEdit() {
      this.$router.push({ name: 'plan/edit', params: { id: this.plan.id } });
    },
    handleDownload(url, name) {
      this.downloadFile({ url, name: `plan_${this.plan.id}_${name}` });
    }
  },
  created() {
    this.retrievePlan(this.plan.id);
    this.getPlanLogs(this.plan.id);
  },
  components: {
    [Icon.name]: Icon,
    [PlanReadonly.name]: PlanReadonly
  }
};
</script>
