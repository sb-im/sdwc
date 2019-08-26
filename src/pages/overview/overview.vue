<template>
  <div class="sd-overview">
    <el-row class="sd-overview__counters">
      <el-col :sm="24" :md="8">
        <sd-overview-counter icon="drone" :caption="$t('sidemenu.air')" :value="drones.length" background-color="#ecf5ff"></sd-overview-counter>
      </el-col>
      <el-col :sm="24" :md="8">
        <sd-overview-counter icon="depot" :caption="$t('sidemenu.depot')" :value="depots.length" background-color="#f0f9eb"></sd-overview-counter>
      </el-col>
      <el-col :sm="24" :md="8">
        <sd-overview-counter icon="task" :caption="$t('sidemenu.plan')" :value="plan.info.length" background-color="#fef0f0"></sd-overview-counter>
      </el-col>
    </el-row>
    <sd-overview-map v-if="configLoaded" :markers="markers"></sd-overview-map>
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
    [OverviewMap.name]: OverviewMap,
    [OverviewCounter.name]: OverviewCounter
  }
};
</script>

<style>
.sd-overview__counters {
  margin-bottom: 20px;
}
</style>
