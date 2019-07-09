<template>
  <sd-card class="sd-map" icon="map" title="GPS" dense>
    <template #action>
      <el-radio-group v-model="type" size="small" @change="onMapTypeChange">
        <el-radio-button v-for="(value, key) of MapType" :key="key" :label="value">{{ key }}</el-radio-button>
      </el-radio-group>
    </template>
    <component :is="type" v-bind="$attrs" :positionDepot="positionDepot"></component>
  </sd-card>
</template>

<script>
import { mapActions, mapState } from 'vuex';

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
    point: {
      type: Object,
      required: false
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
      'node',
      'preference'
    ]),
    positionDepot() {
      if (!this.point) return null;
      const droneId = this.point.id;
      for (const node of this.node) {
        if (node.info.type_name === 'depot'
          && node.status === 0
          && node.msg.status
          && node.msg.status.link_id === droneId
        ) {
          return node.position;
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
