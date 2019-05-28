<template>
  <iframe
    :src="source"
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
    source: {
      type: String,
      required: true
    }
  }
};
</script>
