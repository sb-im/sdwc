<template>
  <sd-map
    class="overview-map"
    icon="map-marker"
    title="common.overview"
    :polylines="polylines"
    :markers="markers"
    :fit="fit"
    @map-move="handleMove"
    @map-change="handleClose"
    @marker-click="handleMarkerClick"
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
      <el-popover
        ref="popover"
        trigger="manual"
        popper-class="map__popover"
        v-model="popover.show"
        @after-leave="handleAfterLeave"
      >
        <sd-overview-popover
          v-if="selectedNode"
          :node="selectedNode"
          @close="handleClose"
          @update="handleUpdate"
        ></sd-overview-popover>
      </el-popover>
    </template>
  </sd-map>
</template>

<script>
import get from 'lodash/get';
import { mapState, mapActions, mapGetters } from 'vuex';

import { PlaceStyle } from '@/constants/drone-place-style';
import SdMap from '@/components/map/map.vue';

import OverviewPopover from './overview-popover.vue';

export default {
  name: 'sd-overview-map',
  data() {
    return {
      type: '',
      fit: true,
      popover: {
        show: false,
        node: -1
      }
    };
  },
  computed: {
    ...mapState([
      'node',
      'preference'
    ]),
    ...mapGetters([
      'depots',
      'drones'
    ]),
    dronePlaceStyle() {
      const style = {};
      for (const d of this.drones) {
        const mapPoint = d.info.points.find(p => p.point_type_name === 'map') || {};
        style[d.info.id] = Object.assign({}, PlaceStyle, get(mapPoint, 'params.common.place', {}));
      }
      return style;
    },
    polylines() {
      const polylines = [];
      for (const d of this.drones) {
        const { position, place } = d.msg;
        if (d.status.code !== 0 || position.length <= 0 || Object.keys(place).length <= 0) continue;
        const droneId = d.info.id;
        const placeStyle = this.dronePlaceStyle[droneId];
        const origin = position[0];
        for (const [placeName, pos] of Object.entries(place)) {
          const style = placeStyle[placeName] || {};
          if (style.stroke) {
            polylines.push({
              name: `${droneId}_${placeName}`,
              style,
              coordinates: [origin, pos]
            });
          }
        }
      }
      return polylines;
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
    placeMarkers() {
      const markers = [];
      for (const d of this.drones) {
        const { position, place } = d.msg;
        if (d.status.code !== 0 || position.length <= 0 || Object.keys(place).length <= 0) continue;
        const droneId = d.info.id;
        const placeStyle = this.dronePlaceStyle[droneId];
        for (const [placeName, pos] of Object.entries(place)) {
          const style = placeStyle[placeName] || {};
          markers.push({
            type: 'place',
            id: `${droneId}_${placeName}`,
            name: placeName,
            style: style,
            position: pos
          });
        }
      }
      return markers;
    },
    markers() {
      return [...this.depotMarkers, ...this.droneMarkers, ...this.placeMarkers];
    },
    selectedNode() {
      if (this.popover.node < 0) return null;
      return this.node.find(n => n.info.id === this.popover.node);
    }
  },
  methods: {
    ...mapActions([
      'setPreference',
    ]),
    handleMove() {
      if (this.fit) {
        this.fit = false;
      }
      if (this.popover.show) {
        this.popover.show = false;
      }
    },
    handleFit() {
      this.fit = !this.fit;
      this.setPreference({ overviewFit: this.fit });
      this.popover.show = false;
    },
    handleMapChange(mapType) {
      this.setPreference({ mapType });
    },
    /**
     * @param {number | string} id
     * @param {HTMLDivElement} el
     */
    handleMarkerClick(id, el) {
      this.popover.node = id;
      if (!this.$refs.popover.popperJS) {
        this.$refs.popover.referenceElm = el;
        this.popover.show = true;
      } else if (this.popover.show) {
        this.$refs.popover.popperJS._reference = el;
        this.handleUpdate();
      } else {
        this.popover.show = true;
      }
    },
    handleClose() {
      this.popover.show = false;
    },
    handleAfterLeave() {
      this.popover.node = -1;
    },
    handleUpdate() {
      this.$nextTick(() => this.$refs.popover.updatePopper());
    }
  },
  watch: {
    droneMarkers() {
      if (!this.popover.show) return;
      this.handleUpdate();
    }
  },
  created() {
    this.type = this.preference.mapType;
    this.fit = this.preference.overviewFit;
  },
  components: {
    [SdMap.name]: SdMap,
    [OverviewPopover.name]: OverviewPopover
  }
};
</script>

<style>
.overview-map {
  margin: 0;
}
.overview-map .el-card__body {
  height: calc(100vh - 219px);
}
.overview-map .map__el {
  height: 100%;
}
</style>
