<template>
  <div class="schedule" v-loading="schedules.length <= 0">
    <router-view v-if="schedules.length > 0 && childAttrs !== null" v-bind="childAttrs" :key="key"></router-view>
  </div>
</template>

<script>
import Edit from './edit.vue';
import View from './view.vue';

export default {
  name: 'sd-schedule',
  props: {
    id: {
      type: Number,
      required: true
    }
  },
  computed: {
    /** @returns {ApiTypes.V3.Schedule[]} */
    schedules() { return this.$store.state.schedule; },
    /** @returns {string} */
    key() {
      const { name, params: { id } } = this.$route;
      return `${name}-${id}`;
    },
    /** @returns {{ scheduleId?: number, initial?: ApiTypes.V3.Schedule }} */
    childAttrs() {
      switch (this.$route.name) {
        case 'schedule/view':
        case 'schedule/edit':
          return { scheduleId: this.id };
      }
      return null;
    }
  },
  components: {
    [Edit.name]: Edit,
    [View.name]: View
  }
};
</script>
