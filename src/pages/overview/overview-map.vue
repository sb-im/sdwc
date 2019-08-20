<template>
  <sd-card class="overview-map" icon="map-marker" :title="$t('sidemenu.overview')" dense>
    <template #action>
      <el-radio-group v-model="type" size="small" @change="handleMapChange">
        <el-radio-button v-for="(value, key) of MapType" :key="key" :label="value">{{ key }}</el-radio-button>
      </el-radio-group>
    </template>
    <component :is="type" v-bind="$attrs" fit></component>
  </sd-card>
</template>

<script>
import { mapState, mapActions } from 'vuex';

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
      MapType
    };
  },
  computed: {
    ...mapState([
      'preference'
    ]),
  },
  methods: {
    ...mapActions([
      'setPreference',
    ]),
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
.overview-map {
  margin: 0;
}
.overview-map .el-card__body {
  height: calc(100vh - 215px);
}
.overview-map .map__el {
  height: 100%;
}
</style>
