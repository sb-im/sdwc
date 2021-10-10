<template>
  <div v-loading="!plan">
    <router-view v-if="plan" v-bind="componentProps" :key="key"></router-view>
  </div>
</template>

<script>
import Icon from '@/components/sd-icon.vue';
import Edit from './edit.vue';
import View from './view.vue';

export default {
  name: 'sd-plan',
  props: {
    id: {
      type: Number,
      required: true
    }
  },
  computed: {
    /** @returns {SDWC.PlanInfo[]} */
    plans() { return this.$store.state.plan.info; },
    /** @returns {SDWC.PlanInfo} */
    plan() {
      return this.plans.find(p => p.id === this.id);
    },
    /** @returns {string} */
    key() {
      const { name, params: { id } } = this.$route;
      return `${name}-${id}`;
    },
    /** @returns {{ plan?: SDWC.PlanInfo, initial?: SDWC.PlanInfo }} */
    componentProps() {
      if (!this.plan) {
        return { plan: {}, initial: {} };
      }
      switch (this.$route.name) {
        case 'plan/view': return { plan: this.plan };
        case 'plan/edit': return { initial: this.plan };
      }
      return {};
    }
  },
  components: {
    [Icon.name]: Icon,
    [Edit.name]: Edit,
    [View.name]: View
  }
};
</script>
