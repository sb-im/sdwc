<template>
  <img class="monitor-img" :src="source">
</template>

<script>
export default {
  name: 'sd-node-monitor-img',
  props: {
    source: {
      type: String,
      required: true
    }
  }
};
</script>
