<template>
  <sd-card class="overview-map" icon="map-marker" :title="$t('sidemenu.overview')" dense>
    <template #action>
      <el-button
        :icon="fit ? 'el-icon-data-line' : 'el-icon-data-board'"
        size="small"
        @click="handleFit"
      >{{ $t(`map.${fit ? 'fit' : 'manual'}`) }}</el-button>
      <el-radio-group class="map__switch" size="small" v-model="type" @change="handleMapChange">
        <el-radio-button v-for="(value, key) of MapType" :key="key" :label="value">{{ key }}</el-radio-button>
      </el-radio-group>
    </template>
    <component :is="type" :markers="markers" :fit="fit"></component>
  </sd-card>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex';

import Card from '@/components/card.vue';
import Google from '@/components/map/google.vue';
import AMap from '@/components/map/amap.vue';

const MapType = {
  Google: Google.name,
  AMap: AMap.name
};

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
    MapType() {
      return MapType;
    },
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
    [Card.name]: Card,
    [AMap.name]: AMap,
    [Google.name]: Google
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
