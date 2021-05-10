<template>
  <div class="sd-job-photosphere" ref="container"></div>
</template>

<script>
export default {
  name: 'sd-job-file-photosphere',
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
  async mounted() {
    const { Viewer } = await import(/* webpackChunkName: 'photo-sphere-viewer' */ 'photo-sphere-viewer');
    await import(/* webpackChunkName: 'photo-sphere-viewer-style' */ 'photo-sphere-viewer/dist/photo-sphere-viewer.css');
    const url = URL.createObjectURL(this.blob);
    this.url = url;
    const viewer = new Viewer({
      container: this.$refs.container,
      panorama: url,
      loadingTxt: '',
      navbar: [
        'zoom',
        'download',
        'caption',
        'fullscreen'
      ]
    });
    this.viewer = viewer;
  },
  beforeDestroy() {
    if (this.url) {
      URL.revokeObjectURL(this.url);
      this.url = null;
    }
    if (this.viewer) {
      this.viewer.destroy();
      this.viewer = null;
    }
  }
};
</script>

<style>
.sd-job-photosphere {
  height: 100%;
  width: 100%;
}
</style>
