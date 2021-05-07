<template>
  <div class="plan__files">
    <div class="plan-file-item" v-for="(item, index) of fileEntries" :key="index">
      <template v-if="readonly">
        <el-input readonly :value="t(item.key)"></el-input>
        <el-button
          class="plan-file__button"
          icon="el-icon-download"
          @click="handleDownloadFile(item)"
        >
          <span v-t="'common.download'"></span>
        </el-button>
      </template>
      <template v-else>
        <el-select
          popper-class="plan-file__select"
          placeholder="文件标签"
          filterable
          :allow-create="false"
          default-first-option
          :value="item.key"
          @change="handleFieldInput(index, $event)"
        >
          <el-option
            v-for="f of fields"
            :key="f.key"
            :value="f.key"
            :label="f.label"
            :class="{ 'plan-file__select--hidden': (f.key === item.key) ? false : f.hidden }"
          >
            <span v-text="f.label || f.key"></span>
            <span v-if="f.label" class="plan-file-label__right" v-text="f.key"></span>
          </el-option>
        </el-select>
        <el-upload
          action
          :show-file-list="false"
          :data="item"
          :http-request="handleUpload"
          :disabled="item.button.disabled"
        >
          <el-button class="plan-file__button" :icon="item.button.icon" :type="item.button.type">
            <span v-t="`plan.file.${item.button.text}`"></span>
          </el-button>
        </el-upload>
        <el-button
          class="plan-file__button"
          type="danger"
          icon="el-icon-delete"
          @click="handleDelete(index)"
        ></el-button>
      </template>
    </div>
    <div v-show="this.canAdd" class="plan-file__add">
      <el-button type="primary" icon="el-icon-plus" @click="handleAdd">
        <span v-t="'plan.file.new'"></span>
      </el-button>
    </div>
  </div>
</template>

<script>
import { uploadFile } from '@/api/super-dock';

import { mapActions } from 'vuex';

/**
 * @typedef {{ icon: string, text: string, type?: string, disabled?: boolean }} FileButton
 * @typedef {{ key: string, blobId: string, filename: string, button: FileButton }} FileEntry
 */

const PredefinedFileKeys = new Set([
  'waypoint',
  'speaker',
  'lua',
  'droneconfig'
]);

const FileButton = {
  created: { icon: 'el-icon-folder-opened', text: 'select' },
  selected: { icon: 'el-icon-loading', text: 'pending', type: 'info', disabled: true },
  uploaded: { icon: 'el-icon-folder-add', text: 're', type: 'warning' },
};

export default {
  name: 'sd-plan-files',
  props: {
    value: {
      type: Object,
      default: () => ({})
    },
    readonly: {
      type: Boolean,
      default: false
    }
  },
  data: () => ({
    /** @type {FileEntry[]} */
    fileEntries: []
  }),
  computed: {
    /**
     * `Set<string>` of every key in `fileEntries`
     */
    occupiedKeys() {
      return new Set(this.fileEntries.map(e => e.key));
    },
    canAdd() {
      if (this.readonly) {
        return false;
      }
      if (
        this.occupiedKeys.size >= PredefinedFileKeys.size &&
        // keys in `this.fileEntries` contain every predefined key
        Array.from(PredefinedFileKeys.values()).every(k => this.occupiedKeys.has(k))
      ) {
        return false;
      }
      return true;
    },
    /**
     * file field name dropdown options
     */
    fields() {
      const fields = [];
      // static/predefined fileds
      for (const k of PredefinedFileKeys) {
        fields.push({
          key: k,
          label: this.t(k),
          hidden: this.occupiedKeys.has(k)
        });
      }
      // files that already existed, including predefined or user-defined fileds
      for (const e of this.fileEntries) {
        // to avoid duplicate, only push user-defined fields
        if (!PredefinedFileKeys.has(e.key)) {
          const translatedLabel = this.t(e.key);
          fields.push({
            key: e.key,
            label: translatedLabel === e.key ? '' : translatedLabel,
            hidden: true
          });
        }
      }
      return fields;
    }
  },
  provide: {
    // provide this, all element-ui form widgets would become 'small' size
    elFormItem: {
      elFormItemSize: 'small'
    }
  },
  methods: {
    ...mapActions([
      'downloadBlob',
      'saveBlobAsFile'
    ]),
    t(fileKey) {
      const fullKey = `plan.file.key.${fileKey}`;
      const t = this.$t(this.$te(fullKey) ? fullKey : fileKey);
      return typeof t === 'string' ? t : fileKey;
    },
    updateFileEntries() {
      this.fileEntries = Object.entries(this.value).map(([key, blobId]) => ({
        key,
        blobId,
        filename: '',
        button: `${blobId}`.length > 0 ? FileButton.uploaded : FileButton.created
      }));
    },
    updateValue() {
      const result = {};
      for (const e of this.fileEntries) {
        if (typeof e.blobId === 'string' && e.blobId.length > 0) {
          result[e.key] = e.blobId;
        }
      }
      this.$emit('input', result);
    },
    /**
     * @param {number} index
     * @param {string} $event
     */
    handleFieldInput(index, $event) {
      if (this.readonly) return;
      this.fileEntries[index].key = $event;
      this.updateValue();
    },
    /**
     * @param {FileEntry} entry
     */
    handleDownloadFile(entry) {
      this.downloadBlob(entry.blobId).then(r => {
        // if CORS policy doesn't allow 'Content-Disposition', we cannot get filename;
        // use `entry.key` instead.
        this.saveBlobAsFile({ filename: r.filename || entry.key, blob: r.blob });
      });
    },
    /**
     * @param {import('element-ui/types/upload').HttpRequestOptions} options
     */
    handleUpload(options) {
      const file = options.file;
      const fileEntry = options.data;
      const key = fileEntry.key;
      fileEntry.button = FileButton.selected;
      fileEntry.filename = file.name;
      uploadFile({ [key]: file }).then(r => {
        fileEntry.button = FileButton.uploaded;
        fileEntry.blobId = r[key];
        this.updateValue();
        if (key === 'waypoint') {
          this.$emit('waypoint-file-change', file);
        }
      }).catch(e => {
        fileEntry.button = FileButton.created;
        this.$message.error(this.$t('plan.file.error', { code: e.status }));
      });
    },
    handleDelete(index) {
      this.fileEntries.splice(index, 1);
      this.updateValue();
    },
    handleAdd() {
      if (!this.canAdd) return;
      let i = this.fileEntries.length;
      const newField = this.fields.find(f => !f.hidden) || { key: this.$t('common.file') + `${++i}` };
      let newKey = newField.key;
      while (Object.prototype.hasOwnProperty.call(this.value, newKey)) {
        newKey = this.$t('common.file') + `${++i}`;
      }
      this.fileEntries.push({ key: newKey, button: FileButton.created });
    }
  },
  watch: {
    value() {
      if (!this.readonly) return;
      this.updateFileEntries();
    }
  },
  created() {
    this.updateFileEntries();
  }
};
</script>

<style>
.plan__files {
  height: 210px;
  overflow-y: auto;
}
.plan-file-item {
  display: flex;
  margin-bottom: 6px;
  line-height: 1;
}
.plan-file-item .el-input,
.plan-file-item .el-select {
  flex-grow: 1;
}
.plan-file__button {
  margin-left: 6px;
}
.plan-file__select .el-select-dropdown__item {
  padding: 0 15px;
  font-size: 13px;
  height: 32px;
  line-height: 32px;
}
.plan-file__select .plan-file__select--hidden {
  display: none !important;
}
.plan-file-label__right {
  float: right;
  color: #8492a6;
}
.plan-file__add {
  text-align: right;
}
</style>
