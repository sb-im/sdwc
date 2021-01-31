<template>
  <el-form class="plan__form" label-width="100px" :model="plan">
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
      <span slot="label" v-t="'plan.air'"></span>
      <el-input :value="droneName" :placeholder="$t('common.none')" readonly></el-input>
    </el-form-item>
    <el-form-item size="small">
      <span slot="label" v-t="'plan.files'"></span>
      <sd-plan-files :value="plan.files" readonly></sd-plan-files>
    </el-form-item>
  </el-form>
</template>

<script>
import { mapGetters } from 'vuex';

import Icon from '@/components/sd-icon.vue';
import PlanFiles from './plan-files.vue';

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
    }
  },
  components: {
    [Icon.name]: Icon,
    [PlanFiles.name]: PlanFiles
  }
};
</script>
