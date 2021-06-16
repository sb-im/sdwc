<template>
  <el-dialog
    fullscreen
    append-to-body
    custom-class="sd-job-file"
    :visible.sync="visible"
    :title="$t('plan.job.file')"
    @closed="handleClosed"
  >
    <div v-if="!compo" v-loading="true" class="sd-job-file-loading"></div>
    <component v-else :is="compo" v-bind="file"></component>
  </el-dialog>
</template>

<script>
import { mapActions } from 'vuex';

import Url from './url.vue';
import Text from './text.vue';
import Image from './image.vue';
import IFrame from './iframe.vue';
import IFrameDoc from './iframe-doc.vue';
import PhotoSphere from './photosphere.vue';
import Unknown from './unknown.vue';

const FileTypes = {
  'pano.jpg': PhotoSphere.name,
  'iframe': IFrame.name,
  'html': IFrameDoc.name,
  'jpg': Image.name,
  'txt': Text.name,
  'url': Url.name
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
    [Url.name]: Url,
    [Text.name]: Text,
    [Image.name]: Image,
    [IFrame.name]: IFrame,
    [IFrameDoc.name]: IFrameDoc,
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
