<template>
  <div class="iframe">
    <iframe :src="src" frameborder="0" class="page-iframe"></iframe>
  </div>
</template>

<script>
export default {
  name: 'sd-iframe',
  props: {
    src: {
      type: String,
      required: true
    }
  }
};
</script>

<style>
.iframe, .page-iframe {
  display: block;
  padding: 0;
  width: 100%;
  height: 100%;
}
</style>
