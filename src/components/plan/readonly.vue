<template>
  <el-form class="plan__form" label-width="80px" :model="plan">
    <el-form-item>
      <span slot="label" v-t="'plan.name'"></span>
      <el-input size="small" :value="plan.name" readonly></el-input>
    </el-form-item>
    <el-form-item>
      <span slot="label" v-t="'plan.node'"></span>
      <el-input size="small" :value="nodeName" :placeholder="$t('common.none')" readonly></el-input>
    </el-form-item>
    <el-form-item size="small">
      <span slot="label" v-t="'plan.files'"></span>
      <sd-plan-files :value="plan.files" readonly></sd-plan-files>
    </el-form-item>
  </el-form>
</template>

<script>
import Icon from '@/components/sd-icon.vue';
import PlanFiles from './plan-files.vue';

export default {
  name: 'sd-plan-readonly',
  props: {
    /** @type {Vue.PropOptions<SDWC.PlanInfo>} */
    plan: {
      type: Object,
      required: true
    }
  },
  computed: {
    /** @returns {SDWC.Node[]} */
    nodes() { return this.$store.state.node; },
    /** @returns {string} */
    nodeName() {
      return this.nodes.find(d => d.info.id === this.plan.node_id)?.info?.name ?? '';
    }
  },
  components: {
    [Icon.name]: Icon,
    [PlanFiles.name]: PlanFiles
  }
};
</script>
