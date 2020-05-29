<template>
  <div class="sd-overview">
    <sd-overview-notify></sd-overview-notify>
    <sd-overview-map v-if="configLoaded"></sd-overview-map>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';

import { config } from '@/api/sdwc';
import Card from '@/components/card.vue';
import OverviewMap from './overview-map.vue';
import OverviewNotify from './overview-notify.vue';

export default {
  name: 'sd-overview',
  data() {
    return {
      configLoaded: false
    };
  },
  computed: {
    ...mapState([
      'plan'
    ]),
    ...mapGetters([
      'depots',
      'drones'
    ])
  },
  created() {
    config().then(() => this.configLoaded = true);
  },
  components: {
    [Card.name]: Card,
    [OverviewMap.name]: OverviewMap,
    [OverviewNotify.name]: OverviewNotify
  }
};
</script>
