<template>
  <sd-card class="sd-map" :icon="icon" :title="title" dense>
    <template #action>
      <el-button
        v-if="drone"
        icon="el-icon-delete"
        size="small"
        @click="handlePathClear"
      >{{ $t('map.clear') }}</el-button>
      <span>&nbsp;</span>
      <el-radio-group v-model="type" size="small" @change="handleMapChange">
        <el-radio-button v-for="(value, key) of MapType" :key="key" :label="value">{{ key }}</el-radio-button>
      </el-radio-group>
    </template>
    <component :is="type" v-bind="$attrs" :path="path" :fit="fit" :markers="markers"></component>
  </sd-card>
</template>

<script>
import { mapActions, mapState, mapGetters } from 'vuex';

import Card from '@/components/card.vue';
import Google from './google.vue';
import AMap from './amap.vue';

const MapType = {
  Google: Google.name,
  AMap: AMap.name
};

export default {
  name: 'sd-map',
  inheritAttrs: false,
  props: {
    drone: {
      type: Object
    },
    msg: {
      type: Object
    },
    path: {
      type: Array
    },
    fit: {
      type: Boolean
    }
  },
  data() {
    return {
      type: '',
      MapType
    };
  },
  computed: {
    ...mapState([
      'preference'
    ]),
    ...mapGetters([
      'depots'
    ]),
    icon() {
      return this.fit ? 'map-waypoint' : 'map-marker';
    },
    title() {
      return this.$t(this.fit ? 'map.waypoint' : 'map.satellite');
    },
    /**
     * @returns {SDWC.Marker[]}
     */
    markers() {
      const markers = [
        {
          type: 'drone',
          id: this.drone.id,
          name: this.drone.name,
          position: this.path[0],
          heading: this.msg.status ? this.msg.status.flight.heading : 0
        }
      ];
      for (const d of this.depots) {
        if (d.status === 0
          && d.msg.status
          && d.msg.status.link_id === this.drone.id
        ) {
          markers.push({
            type: 'depot',
            id: d.info.id,
            name: d.info.name,
            position: d.position
          });
        }
      }
      return markers;
    }
  },
  methods: {
    ...mapActions([
      'setPreference',
      'clearDronePath'
    ]),
    handlePathClear() {
      this.clearDronePath(this.drone.id);
    },
    handleMapChange(mapType) {
      this.setPreference({ mapType });
    }
  },
  created() {
    this.type = this.preference.mapType;
  },
  components: {
    [Card.name]: Card,
    [AMap.name]: AMap,
    [Google.name]: Google
  }
};
</script>

<style>
.map__el {
  width: 100%;
  height: 400px;
}
</style>
