<template>
  <iframe v-if="url" class="sd-job-file-iframe" :src="url"></iframe>
</template>

<script>
export default {
  name: 'sd-job-file-iframe',
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
  async created() {
    this.url = await this.blob.text();
  },
  beforeDestroy() {
    if (this.url) {
      this.url = null;
    }
  }
};
</script>

<style>
.sd-job-file-iframe {
  object-fit: contain;
  border: 0;
  height: 100%;
  width: 100%;
}
</style>
