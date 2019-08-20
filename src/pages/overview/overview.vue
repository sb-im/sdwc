<template>
  <div v-if="configLoaded">
    <sd-overview-map :markers="markers"></sd-overview-map>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import { config } from '@/api/sdwc';
import Card from '@/components/card.vue';
import OverviewMap from './overview-map.vue';

export default {
  name: 'sd-overview',
  data() {
    return {
      configLoaded: false
    };
  },
  computed: {
    ...mapGetters([
      'depots',
      'drones'
    ]),
    markers() {
      const result = [];
      for (let d of this.depots) {
        if (d.status === 0) {
          result.push({ id: d.info.id, type: 'depot', name: d.info.name, position: d.position });
        }
      }
      for (let d of this.drones) {
        if (d.status === 0) {
          result.push({ id: d.info.id, type: 'drone', name: d.info.name, position: d.position });
        }
      }
      return result;
    }
  },
  created() {
    config().then(() => this.configLoaded = true);
  },
  components: {
    [Card.name]: Card,
    [OverviewMap.name]: OverviewMap
  }
};
</script>

<style>
</style>
