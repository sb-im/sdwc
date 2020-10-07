<template>
  <img class="sd-job-file-image" :src="url" />
</template>

<script>
export default {
  name: 'sd-job-file-image',
  props: {
    filename: {
      type: String,
      required: true
    },
    blob: {
      type: Blob,
      required: true
    }
  },
  data: () => ({
    url: ''
  }),
  created() {
    this.url = URL.createObjectURL(this.blob);
  },
  beforeDestroy() {
    if (this.url) {
      URL.revokeObjectURL(this.url);
      this.url = null;
    }
  }
};
</script>

<style>
img.sd-job-file-image {
  object-fit: contain;
  height: 100%;
  width: 100%;
}
</style>
