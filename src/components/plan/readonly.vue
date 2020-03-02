<template>
  <el-form label-width="100px" :model="plan">
    <el-form-item>
      <span slot="label" v-t="'plan.name'"></span>
      <el-input :value="plan.name" readonly></el-input>
    </el-form-item>
    <el-form-item>
      <span slot="label" v-t="'plan.desc'"></span>
      <el-input
        type="textarea"
        resize="none"
        :placeholder="$t('plan.desc_no')"
        :value="plan.description"
        readonly
      ></el-input>
    </el-form-item>
    <el-form-item>
      <span slot="label" v-t="'plan.ctime'"></span>
      <el-date-picker :value="plan.created_at" type="datetime" readonly></el-date-picker>
    </el-form-item>
    <el-form-item>
      <span slot="label" v-t="'plan.air'"></span>
      <el-input :value="droneName" :placeholder="$t('common.none')" readonly></el-input>
    </el-form-item>
    <el-form-item>
      <span slot="label" v-t="'plan.cycle'"></span>
      <el-input :value="cycleTypeName" :placeholder="$t('common.none')" readonly></el-input>
    </el-form-item>
    <el-form-item>
      <span slot="label" v-t="'plan.first_time'"></span>
      <el-date-picker
        :value="plan.start_time"
        type="datetime"
        :placeholder="$t('common.none')"
        readonly
      ></el-date-picker>
    </el-form-item>
    <el-form-item>
      <span slot="label" v-t="'plan.mapfile'"></span>
      <el-button
        type="primary"
        size="medium"
        icon="el-icon-download"
        :disabled="!plan.map_path"
        @click="handleMapDownload"
        v-t="'common.download'"
      ></el-button>
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
      const drone = this.drones.find(d => d.info.id === this.plan.node_id);
      if (drone) return drone.info.name;
      return '';
    },
    cycleTypeName() {
      const t = this.plan.cycle_types_id;
      return typeof t === 'number' ? this.$t(`plan.edit.cycle.${t}`) : '';
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
