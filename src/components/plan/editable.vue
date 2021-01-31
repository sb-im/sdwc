<template>
  <el-form class="plan__form" label-width="100px" :model="plan">
    <el-form-item>
      <span slot="label" v-t="'plan.name'"></span>
      <el-input v-model="plan.name" :placeholder="$t('plan.edit.name_inp')"></el-input>
    </el-form-item>
    <el-form-item>
      <span slot="label" v-t="'plan.desc'"></span>
      <el-input
        type="textarea"
        :rows="2"
        :placeholder="$t('plan.edit.desc_inp')"
        v-model="plan.description"
      ></el-input>
    </el-form-item>
    <el-form-item>
      <span slot="label" v-t="'plan.air'"></span>
      <el-select v-model="plan.node_id" :placeholder="$t('plan.edit.air_inp')">
        <el-option v-for="d in drones" :key="d.id" :label="d.info.name" :value="d.info.id"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item size="small">
      <span slot="label" v-t="'plan.files'"></span>
      <sd-plan-files v-model="plan.files" @waypoint-file-change="handleWaypointChange"></sd-plan-files>
    </el-form-item>
  </el-form>
</template>

<script>
import { mapGetters } from 'vuex';

import { parseWaypoints } from '@/util/waypoint-parser';

import Icon from '@/components/sd-icon.vue';
import PlanFiles from './plan-files.vue';

export default {
  name: 'sd-plan-editable',
  props: {
    initial: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      plan: Object.assign({}, this.initial)
    };
  },
  computed: {
    ...mapGetters([
      'drones'
    ]),
  },
  methods: {
    getPlan() {
      return this.plan;
    },
    handleWaypointChange(file) {
      const reader = new FileReader();
      reader.onload = e => {
        this.$emit('waypoint-change', parseWaypoints(e.target.result));
      };
      reader.readAsText(file);
    },
  },
  components: {
    [Icon.name]: Icon,
    [PlanFiles.name]: PlanFiles
  }
};
</script>

<style>
.plan__form {
  height: 410px;
}
.plan__form .el-form-item:last-child {
  margin-bottom: 0;
}
</style>
