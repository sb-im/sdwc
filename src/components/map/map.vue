<template>
  <sd-card class="sd-map" :icon="icon" :title="title" dense>
    <template #action>
      <el-radio-group v-model="type" size="small" @change="onMapTypeChange">
        <el-radio-button v-for="(value, key) of MapType" :key="key" :label="value">{{ key }}</el-radio-button>
      </el-radio-group>
    </template>
    <component :is="type" v-bind="$attrs" :fit="fit" :positionDepot="positionDepot"></component>
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
    positionDepot() {
      if (!this.drone) return null;
      for (const d of this.depots) {
        if (d.status === 0
          && d.msg.status
          && d.msg.status.link_id === this.drone.id
        ) {
          return d.position;
        }
      }
      return null;
    }
  },
  methods: {
    ...mapActions([
      'setPreference'
    ]),
    onMapTypeChange(mapType) {
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
