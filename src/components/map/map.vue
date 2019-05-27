<template>
  <sd-card icon="drone/d_task" title="GPS" dense>
    <template #action>
      <el-radio-group v-model="type" size="small" @change="onMapTypeChange">
        <el-radio-button v-for="(value, key) of MapType" :key="key" :label="value">{{ key }}</el-radio-button>
      </el-radio-group>
    </template>
    <component :is="type" v-bind="$attrs"></component>
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
  data() {
    return {
      type: '',
      MapType
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
