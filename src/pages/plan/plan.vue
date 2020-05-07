<template>
  <div class="plan" v-loading="!plan">
    <router-view v-if="plan" v-bind="componentProps" :key="key"></router-view>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';

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
    ...mapState({
      plans: state => state.plan.info,
      logs: state => state.plan.log
    }),
    plan() {
      return this.plans.find(p => p.id === this.id);
    },
    key() {
      const { name, params: { id } } = this.$route;
      return `${name}-${id}`;
    },
    componentProps() {
      if (!this.plan) {
        return { plan: {}, initial: {} };
      }
      switch (this.$route.name) {
        case 'plan/view': return { plan: this.plan, log: this.log };
        case 'plan/edit': return { initial: this.plan };
      }
      return {};
    }
  },
  methods: {
    ...mapActions([
      'getPlanLogs'
    ])
  },
  components: {
    [Icon.name]: Icon,
    [Edit.name]: Edit,
    [View.name]: View
  }
};
</script>
