<template>
  <div v-loading="plans.length <= 0">
    <router-view v-if="plans.length > 0 && childAttrs !== null" v-bind="childAttrs" :key="key"></router-view>
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
    /** @returns {SDWC.PlanState[]} */
    plans() { return this.$store.state.plan; },
    /** @returns {string} */
    key() {
      const { name, params: { id } } = this.$route;
      return `${name}-${id}`;
    },
    /** @returns {{ planId?: number, initial?: SDWC.PlanInfo }} */
    childAttrs() {
      switch (this.$route.name) {
        case 'plan/view': return { planId: this.id };
        case 'plan/edit': return { initial: this.plans.find(p => p.info.id === this.id)?.info ?? {} };
      }
      return null;
    }
  },
  components: {
    [Icon.name]: Icon,
    [Edit.name]: Edit,
    [View.name]: View
  }
};
</script>
