<template>
  <img class="monitor-img" :src="point.params.url" :style="imgStyle" />
</template>

<script>
export default {
  name: 'sd-node-monitor-img',
  props: {
    point: {
      type: Object,
      required: true
    },
    objectFit: {
      type: String,
      default: ''
    }
  },
  computed: {
    /** @returns {string} */
    imgStyle() {
      if (!this.objectFit) return '';
      return `object-fit:${this.objectFit}`;
    },
  }
};
</script>
