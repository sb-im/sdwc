<template>
  <sd-card class="sd-map" :icon="icon" :title="title" dense>
    <template #action>
      <slot name="action"></slot>
      <el-radio-group class="map__switch" size="small" v-model="type" @change="handleMapChange">
        <el-radio-button v-for="(value, key) of MapType" :key="key" :label="value">{{ key }}</el-radio-button>
      </el-radio-group>
    </template>
    <component :is="type" v-bind="$attrs" v-on="$listeners"></component>
  </sd-card>
</template>

<script>
import { mapActions, mapState } from 'vuex';

import Card from '@/components/card.vue';

import AMap from './amap.vue';
import Google from './google.vue';
import Mapbox from './mapbox.vue';

const MapType = {
  AMap: AMap.name,
  Google: Google.name,
  Mapbox: Mapbox.name
};

export default {
  name: 'sd-map',
  inheritAttrs: false,
  props: {
    icon: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      type: ''
    };
  },
  computed: {
    ...mapState([
      'preference'
    ])
  },
  methods: {
    ...mapActions([
      'setPreference'
    ]),
    handleMapChange(mapType) {
      this.$emit('map-change');
      this.setPreference({ mapType });
    }
  },
  created() {
    this.MapType = MapType;
    this.type = this.preference.mapType;
  },
  components: {
    [Card.name]: Card,
    [AMap.name]: AMap,
    [Google.name]: Google,
    [Mapbox.name]: Mapbox
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
/**
 * disable magnifier when touch-hold on Safari
 */
.sd--safari .map__el {
  -webkit-user-select: none;
}
</style>
