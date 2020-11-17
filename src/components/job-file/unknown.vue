<template>
  <div class="sd-job-file-unknown">
    <el-card>
      <div class="sd-job-file-unknown__bkg">
        <i class="el-icon-document sd-job-file-unknown__icon"></i>
      </div>
      <div class="sd-job-file-unknown__caption">
        <div>
          <div v-text="filename"></div>
          <div v-text="size"></div>
        </div>
        <el-button type="primary" icon="el-icon-download" @click="handleDownload"></el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  name: 'sd-job-file-unknown',
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
    size: '-/-'
  }),
  created() {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = this.blob.size;
    let i = 0;
    while (size >= 1000) {
      size /= 1024;
      i++;
    }
    this.size = `${size.toFixed(1)} ${units[i]}`;
  },
  methods: {
    ...mapActions([
      'saveBlobAsFile'
    ]),
    handleDownload() {
      this.saveBlobAsFile({ filename: this.filename, blob: this.blob });
    }
  }
};
</script>

<style>
.sd-job-file-unknown,
.sd-job-file-unknown__bkg,
.sd-job-file-unknown__caption {
  display: flex;
  align-items: center;
  justify-content: center;
}
.sd-job-file-unknown {
  height: 100%;
}
.sd-job-file-unknown__bkg {
  height: 200px;
  width: 300px;
  background: #f5f7fa;
  color: #909399;
}
.sd-job-file-unknown__icon {
  font-size: 30px;
}
.sd-job-file-unknown__caption {
  margin-top: 14px;
  justify-content: space-between;
}
</style>
