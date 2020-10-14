<template>
  <div class="sd-job-file-url sd-job-file-unknown">
    <el-card>
      <div class="sd-job-file-unknown__bkg">
        <i class="el-icon-link sd-job-file-unknown__icon"></i>
      </div>
      <div class="sd-job-file-unknown__caption">
        <div>
          <div v-text="filename"></div>
          <div class="sd-job-file-url__url" v-text="url"></div>
        </div>
        <el-button type="primary" icon="el-icon-top-right" @click="handleOpen"></el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'sd-job-file-url',
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
  methods: {
    handleOpen() {
      if (!this.url) return;
      window.open(this.url);
    }
  },
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
.sd-job-file-url__url {
  max-width: 240px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
