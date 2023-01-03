<template>
  <el-form class="plan__form" label-width="80px" size="small" :model="plan">
    <el-form-item>
      <span slot="label" v-t="'plan.name'"></span>
      <el-input :value="plan.name" readonly></el-input>
    </el-form-item>
    <el-form-item>
      <span slot="label" v-t="'plan.node'"></span>
      <router-link v-if="nodeRoute" :to="nodeRoute" v-slot="{ href }">
        <a class="plan__node" :href="href">
          <el-input :value="nodeName" readonly></el-input>
        </a>
      </router-link>
      <el-input v-else :placeholder="$t('common.none')" readonly></el-input>
    </el-form-item>
    <el-form-item>
      <span slot="label" v-t="'plan.files'"></span>
      <sd-plan-files :value="plan.files" readonly></sd-plan-files>
    </el-form-item>
    <el-form-item>
      <span slot="label" v-t="'plan.extra'"></span>
      <sd-plan-extra :value="plan.extra" readonly></sd-plan-extra>
    </el-form-item>
  </el-form>
</template>

<script>
import Icon from '@/components/sd-icon.vue';
import PlanFiles from './plan-files.vue';
import PlanExtra from './plan-extra.vue';

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
    /** @returns {SDWC.Node?} */
    node() { return this.nodes.find(d => d.info.id === this.plan.node_id); },
    /** @returns {string} */
    nodeName() {
      return this.node?.info?.name ?? '';
    },
    /** @returns {import('vue-router').Route} */
    nodeRoute() {
      if (this.node) {
        return { name: 'node', params: { id: this.node.info.uuid } };
      }
      return null;
    }
  },
  components: {
    [Icon.name]: Icon,
    [PlanFiles.name]: PlanFiles,
    [PlanExtra.name]: PlanExtra
  }
};
</script>

<style>
.plan__node .el-input__inner {
  cursor: pointer;
}
.plan__node .el-input__inner:hover {
  cursor: pointer;
  color: #409eff;
  text-decoration: underline;
}
</style>
