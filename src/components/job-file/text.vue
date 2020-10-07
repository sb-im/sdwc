<template>
  <pre class="sd-job-file-text" v-text="text"></pre>
</template>

<script>
export default {
  name: 'sd-job-file-text',
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
    text: ''
  }),
  async created() {
    this.text = await this.blob.text();
  },
  beforeDestroy() {
    this.text = null;
  }
};
</script>

<style>
.sd-job-file-text {
  font-size: 14px;
  margin: 14px;
}
</style>
