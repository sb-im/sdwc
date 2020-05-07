<template>
  <sd-map
    class="overview-map"
    icon="map-marker"
    title="common.overview"
    :markers="markers"
    :places="places"
    :fit="fit"
    :marker-styling="styling"
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
      <el-popover ref="popover" trigger="manual" popper-class="map__popover" v-model="popover.show">
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
import { mapState, mapActions, mapGetters } from 'vuex';

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
        const position = d.msg.position[0];
        if (d.status.code !== 0 || !position || !position.place) continue;
        const droneId = d.info.id;
        for (const [placeName, pos] of Object.entries(position.place)) {
          const arr = Array.isArray(pos) ? pos : [pos];
          for (const p of arr) {
            markers.push({
              type: 'place',
              id: `${droneId}_${placeName}`,
              name,
              position: p
            });
          }
        }
      }
      return markers;
    },
    markers() {
      return [...this.depotMarkers, ...this.droneMarkers, ...this.placeMarkers];
    },
    places() {
      const paths = [];
      for (const d of this.drones) {
        const position = d.msg.position[0];
        if (d.status.code !== 0 || !position || !position.place) continue;
        const p = [position];
        for (const [name, pos] of Object.entries(position.place)) {
          paths.push({
            name,
            path: p.concat(pos)
          });
        }
      }
      return paths;
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
        this.$nextTick(() => this.$refs.popover.updatePopper());
      } else {
        this.popover.show = true;
      }
    },
    handleClose() {
      this.popover.show = false;
      setTimeout(() => this.popover.node = -1, 200);
    },
    handleUpdate() {
      this.$nextTick(() => this.$refs.popover.updatePopper());
    }
  },
  watch: {
    droneMarkers() {
      if (!this.popover.show) return;
      this.$nextTick(() => this.$refs.popover.updatePopper());
    }
  },
  created() {
    this.type = this.preference.mapType;
    this.fit = this.preference.overviewFit;
    this.styling = {
      target: { stroke: 'dotted', color: '#409eff' },
      roi: { point: 'glow', color: '#f69730' },
      home: { color: '#67c23a' }
    };
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
  height: calc(100vh - 379px);
}
.overview-map .map__el {
  height: 100%;
}
</style>
