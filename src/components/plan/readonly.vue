<template>
  <el-form label-width="100px" :model="plan">
    <el-form-item :label="$t('plan.plan_name')">
      <el-input v-model="plan.name" readonly></el-input>
    </el-form-item>
    <el-form-item :label="$t('plan.plan_desc')">
      <el-input
        type="textarea"
        resize="none"
        :placeholder="$t('plan.plan_desc_no')"
        v-model="plan.description"
        readonly
      ></el-input>
    </el-form-item>
    <el-form-item :label="$t('plan.plan_createtime')">
      <el-date-picker v-model="plan.created_at" type="datetime" readonly></el-date-picker>
    </el-form-item>
    <el-form-item :label="$t('plan.plan_air')">
      <el-input v-model="droneName" :placeholder="$t('common.none')" readonly></el-input>
    </el-form-item>
    <el-form-item :label="$t('plan.plan_cycle')">
      <el-input v-model="cycleTypeName" readonly></el-input>
    </el-form-item>
    <el-form-item :label="$t('plan.plan_first_time')">
      <el-date-picker
        v-model="plan.start_time"
        type="datetime"
        :placeholder="$t('common.none')"
        readonly
      ></el-date-picker>
    </el-form-item>
    <el-form-item :label="$t('plan.plan_mapfile')">
      <el-button
        type="primary"
        size="medium"
        icon="el-icon-download"
        :disabled="!plan.map_path"
        @click="handleMapDownload"
      >{{ $t('common.download') }}</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import Icon from '@/components/sd-icon.vue';

export default {
  name: 'sd-plan-readonly',
  props: {
    plan: {
      type: Object,
      required: true
    }
  },
  computed: {
    ...mapGetters([
      'drones'
    ]),
    droneName() {
      const drone = this.drones.find(d => d.id === this.plan.node_id);
      if (drone) return drone.name;
      return '';
    },
    cycleTypeName() {
      return this.$t(`plan.edit.cycle_type_${this.plan.cycle_types_id + 1}`);
    }
  },
  methods: {
    ...mapActions([
      'downloadFile'
    ]),
    handleMapDownload() {
      this.downloadFile({ url: this.plan.map_path, name: `plan_${this.plan.id}.waypoints` });
    }
  },
  components: {
    [Icon.name]: Icon
  }
};
</script>
