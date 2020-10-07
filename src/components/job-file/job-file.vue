<template>
  <el-dialog
    fullscreen
    append-to-body
    custom-class="sd-job-file"
    :visible.sync="visible"
    title="查看文件"
    @closed="handleClosed"
  >
    <div v-if="!compo" v-loading="true" class="sd-job-file-loading"></div>
    <component v-else :is="compo" v-bind="file"></component>
  </el-dialog>
</template>

<script>
import { mapActions } from 'vuex';

import Text from './text.vue';
import Image from './image.vue';
import PhotoSphere from './photosphere.vue';
import Unknown from './unknown.vue';

const FileTypes = {
  'pano.jpg': PhotoSphere.name,
  'jpg': Image.name,
  'txt': Text.name
};

export default {
  name: 'sd-job-file',
  data: () => ({
    visible: false,
    blobId: -1,
    file: {
      filename: null,
      blob: null
    }
  }),
  computed: {
    compo() {
      if (typeof this.file.filename !== 'string') return null;
      const filename = this.file.filename.toLowerCase();
      for (const type in FileTypes) {
        if (filename.endsWith(type)) {
          return FileTypes[type];
        }
      }
      return Unknown.name;
    }
  },
  methods: {
    ...mapActions([
      'downloadBlob'
    ]),
    open(id) {
      this.blobId = id;
      this.visible = true;
      this.downloadBlob(id).then(file => {
        this.file = file;
      });
    },
    handleClosed() {
      this.file = {
        filename: null,
        blob: null
      };
    }
  },
  components: {
    [Text.name]: Text,
    [Image.name]: Image,
    [PhotoSphere.name]: PhotoSphere,
    [Unknown.name]: Unknown
  }
};
</script>

<style>
.sd-job-file {
  display: flex;
  flex-direction: column;
  border: none;
  border-radius: 0;
}
.sd-job-file .el-dialog__body {
  padding: 0;
  overflow: auto;
  height: 100%;
  flex-grow: 1;
}
.sd-job-file-loading {
  height: 100%;
}
</style>
