<template>
  <sd-card class="sd-map" :icon="icon" :title="title" dense>
    <template #action>
      <slot name="action"></slot>
    </template>
    <sd-map-mapbox v-bind="$attrs" v-on="$listeners"></sd-map-mapbox>
  </sd-card>
</template>

<script>
import Card from '@/components/card.vue';

import Mapbox from './mapbox.vue';

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
  components: {
    [Card.name]: Card,
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
