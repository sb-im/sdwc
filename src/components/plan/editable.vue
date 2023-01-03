<template>
  <el-form class="plan__form" label-width="80px" size="small" :model="plan">
    <el-form-item>
      <span slot="label" v-t="'plan.name'"></span>
      <el-input v-model="plan.name" :placeholder="$t('plan.edit.name_inp')"></el-input>
    </el-form-item>
    <el-form-item>
      <span slot="label" v-t="'plan.node'"></span>
      <el-select v-model="plan.node_id" :placeholder="$t('plan.edit.node_inp')">
        <el-option v-for="n in depots" :key="n.info.id" :label="n.info.name" :value="n.info.id"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item>
      <span slot="label" v-t="'plan.files'"></span>
      <sd-plan-files v-model="plan.files" @waypoint-file-change="handleWaypointChange"></sd-plan-files>
    </el-form-item>
    <el-form-item>
      <span slot="label" v-t="'plan.extra'"></span>
      <sd-plan-extra v-model="plan.extra"></sd-plan-extra>
    </el-form-item>
  </el-form>
</template>

<script>
import { parseWaypoints } from '@/util/waypoint-parser';

import Icon from '@/components/sd-icon.vue';
import PlanFiles from './plan-files.vue';
import PlanExtra from './plan-extra.vue';

export default {
  name: 'sd-plan-editable',
  props: {
    /** @type {Vue.PropOptions<SDWC.PlanInfo>} */
    initial: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      /** @type {SDWC.PlanInfo} */
      plan: Object.assign({}, this.initial)
    };
  },
  computed: {
    /** @returns {SDWC.Node[]} */
    depots() { return this.$store.getters.depots; }
  },
  methods: {
    getPlan() {
      return this.plan;
    },
    handleWaypointChange(file) {
      const reader = new FileReader();
      reader.onload = async e => {
        this.$emit('waypoint-change', await parseWaypoints(e.target.result));
      };
      reader.readAsArrayBuffer(file);
    },
  },
  components: {
    [Icon.name]: Icon,
    [PlanFiles.name]: PlanFiles,
    [PlanExtra.name]: PlanExtra
  }
};
</script>

<style>
.plan__form {
  height: 400px;
}
.plan__form .el-form-item {
  margin-bottom: 10px;
}
.plan__form .el-input--small {
  font-size: inherit;
}
.plan__form .el-form-item:last-child {
  margin-bottom: 0;
}
</style>
