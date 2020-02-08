<template>
  <div class="sd-overview">
    <div class="sd-overview__counters">
      <sd-overview-counter icon="drone" :caption="$t('sidemenu.air')" :value="drones.length" background-color="#ecf5ff"></sd-overview-counter>
      <sd-overview-counter icon="depot" :caption="$t('sidemenu.depot')" :value="depots.length" background-color="#f0f9eb"></sd-overview-counter>
      <sd-overview-counter icon="task" :caption="$t('sidemenu.plan')" :value="plan.info.length" background-color="#fef0f0"></sd-overview-counter>
    </div>
    <sd-overview-map v-if="configLoaded"></sd-overview-map>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';

import { config } from '@/api/sdwc';
import Card from '@/components/card.vue';
import OverviewMap from './overview-map.vue';
import OverviewCounter from './overview-counter.vue';

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
    [OverviewCounter.name]: OverviewCounter
  }
};
</script>

<style>
.sd-overview__counters {
  display: flex;
  margin-bottom: 10px;
}
</style>
