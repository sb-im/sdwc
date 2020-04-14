<template>
  <sd-map
    class="overview-map"
    icon="map-marker"
    title="common.overview"
    :markers="markers"
    :fit="fit"
    selectable
    @map-move="handleMove"
  >
    <template #action>
      <el-button
        :icon="`el-icon-data-${fit ? 'line' : 'board'}`"
        :type="fit ? 'primary' : 'default'"
        size="small"
        @click="handleFit"
      >
        <span v-t="'map.fit'"></span>
      </el-button>
    </template>
  </sd-map>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex';

import SdMap from '@/components/map/map.vue';

export default {
  name: 'sd-overview-map',
  data() {
    return {
      type: '',
      fit: true
    };
  },
  computed: {
    ...mapState([
      'preference'
    ]),
    ...mapGetters([
      'depots',
      'drones'
    ]),
    droneMarkers() {
      const markers = [];
      for (let d of this.drones) {
        const position = d.msg.position[0];
        if (d.status.code === 0 && typeof position === 'object') {
          markers.push({
            type: 'drone',
            id: d.info.id,
            name: d.info.name,
            position,
            heading: position.heading
          });
        }
      }
      return markers;
    },
    depotMarkers() {
      const markers = [];
      for (const d of this.depots) {
        const { code, status } = d.status;
        if (code === 0) {
          markers.push({
            type: 'depot',
            id: d.info.id,
            name: d.info.name,
            position: {
              lng: +status.lng,
              lat: +status.lat,
            }
          });
        }
      }
      return markers;
    },
    markers() {
      return [...this.depotMarkers, ...this.droneMarkers];
    },
  },
  methods: {
    ...mapActions([
      'setPreference',
    ]),
    handleMove() {
      if (this.fit) {
        this.fit = false;
      }
    },
    handleFit() {
      this.fit = !this.fit;
      this.setPreference({ overviewFit: this.fit });
    },
    handleMapChange(mapType) {
      this.setPreference({ mapType });
    }
  },
  created() {
    this.type = this.preference.mapType;
    this.fit = this.preference.overviewFit;
  },
  components: {
    [SdMap.name]: SdMap
  }
};
</script>

<style>
.overview-map {
  margin: 0;
}
.overview-map .el-card__body {
  height: calc(100vh - 315px);
}
.overview-map .map__el {
  height: 100%;
}
</style>
