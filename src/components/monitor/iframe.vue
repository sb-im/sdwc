<template>
  <iframe
    :src="point.params.url"
    class="monitor-iframe"
    width="100%"
    height="100%"
    allowfullscreen="true"
  ></iframe>
</template>

<script>
export default {
  name: 'sd-node-monitor-iframe',
  props: {
    point: {
      type: Object,
      required: true
    }
  }
};
</script>
