<template>
  <sd-card class="sd-map" :icon="icon" :title="title" dense>
    <template #action>
      <el-button
        v-if="drone"
        :icon="follow ? 'el-icon-location' : 'el-icon-location-outline'"
        size="small"
        @click="handleFollow"
      >{{ $t(`map.${follow ? 'follow' : 'manual'}`) }}</el-button>
      <el-button
        v-if="drone"
        icon="el-icon-delete"
        size="small"
        @click="handlePathClear"
      >{{ $t('map.clear') }}</el-button>
      <el-radio-group class="map__switch" size="small" v-model="type" @change="handleMapChange">
        <el-radio-button v-for="(value, key) of MapType" :key="key" :label="value">{{ key }}</el-radio-button>
      </el-radio-group>
    </template>
    <component
      :is="type"
      v-bind="$attrs"
      :path="path"
      :markers="markers"
      :fit="fit"
      :follow="follow"
    ></component>
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
      follow: true
    };
  },
  computed: {
    ...mapState([
      'preference'
    ]),
    ...mapGetters([
      'depots'
    ]),
    MapType() {
      return MapType;
    },
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
      if (this.$attrs.markers) {
        return this.$attrs.markers;
      }
      if (!this.drone) {
        return null;
      }
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
    handleFollow() {
      this.follow = !this.follow;
      this.setPreference({ mapFollow: this.follow });
    },
    handlePathClear() {
      this.clearDronePath(this.drone.id);
    },
    handleMapChange(mapType) {
      this.setPreference({ mapType });
    }
  },
  created() {
    this.type = this.preference.mapType;
    this.follow = this.preference.mapFollow;
  },
  components: {
    [Card.name]: Card,
    [AMap.name]: AMap,
    [Google.name]: Google
  }
};
</script>

<style>
.map__switch {
  margin-left: 10px;
}
.map__el {
  width: 100%;
  height: 400px;
}
</style>
