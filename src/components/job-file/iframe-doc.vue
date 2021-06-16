<template>
  <iframe v-if="doc" class="sd-job-file-iframe" :srcDoc="doc"></iframe>
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
    doc: ''
  }),
  async created() {
    this.doc = await this.blob.text();
  },
  beforeDestroy() {
    if (this.doc) {
      this.doc = null;
    }
  }
};
</script>
