<template>
  <img class="monitor-img" :src="point.name">
</template>

<script>
export default {
  name: 'sd-node-monitor-img',
  props: {
    point: {
      type: Object,
      required: true
    }
  }
};
</script>
