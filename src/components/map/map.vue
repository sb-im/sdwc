<template>
  <sd-card icon="drone/d_task" title="GPS" dense>
    <sd-map-google v-bind="$attrs"></sd-map-google>
  </sd-card>
</template>

<script>
import Card from '@/components/card.vue';
import Google from './google.vue';

export default {
  name: 'sd-map',
  inheritAttrs: false,
  components: {
    [Card.name]: Card,
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
