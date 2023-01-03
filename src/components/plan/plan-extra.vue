<template>
  <div class="plan__files plan__extra">
    <div v-if="readonly && extraEntries.length <= 0">
      <el-input readonly :value="t('common.none')"></el-input>
    </div>
    <div class="plan-file-item" v-for="(item, index) of extraEntries" :key="index">
      <template v-if="readonly">
        <el-input readonly :value="item.value">
          <template #prepend>
            <span v-t="item.key"></span>
          </template>
        </el-input>
      </template>
      <template v-else>
        <el-input v-model="item.value" @change="updateValue">
          <template #prepend>
            <el-select
              popper-class="plan-file__select"
              :placeholder="$t('plan.extra')"
              filterable
              :allow-create="true"
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
          </template>
        </el-input>
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
/**
 * @typedef {{ key: string, label: string, hidden: boolean }} ExtraField
 * @typedef {{ key: string, value: string }} ExtraEntry
 */

const PredefinedExtraKeys = new Set([
]);

export default {
  name: 'sd-plan-extra',
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
    /** @type {ExtraEntry[]} */
    extraEntries: []
  }),
  computed: {
    /**
     * every key in `extraEntries`
     * @returns {Set<string>}
     */
    occupiedKeys() {
      return new Set(this.extraEntries.map(e => e.key));
    },
    /** @returns {boolean} */
    canAdd() {
      if (this.readonly) {
        return false;
      }
      if (PredefinedExtraKeys.size <= 0) {
        return true;
      }
      if (
        this.occupiedKeys.size >= PredefinedExtraKeys.size &&
        // keys in `this.extraEntries` contain every predefined key
        Array.from(PredefinedExtraKeys.values()).every(k => this.occupiedKeys.has(k))
      ) {
        return false;
      }
      return true;
    },
    /**
     * file field name dropdown options
     * @returns {ExtraField[]}
     */
    fields() {
      const fields = [];
      // static/predefined fileds
      for (const k of PredefinedExtraKeys) {
        fields.push({
          key: k,
          label: this.t(k),
          hidden: this.occupiedKeys.has(k)
        });
      }
      // files that already existed, including predefined or user-defined fileds
      for (const e of this.extraEntries) {
        // to avoid duplicate, only push user-defined fields
        if (!PredefinedExtraKeys.has(e.key)) {
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
    t(fileKey) {
      const fullKey = `plan.file.key.${fileKey}`;
      const t = this.$t(this.$te(fullKey) ? fullKey : fileKey);
      return typeof t === 'string' ? t : fileKey;
    },
    updateExtraEntries() {
      this.extraEntries = Object.entries(this.value).map(([key, value]) => ({ key, value }));
    },
    updateValue() {
      const result = {};
      for (const e of this.extraEntries) {
        if (typeof e.value === 'string' && e.value.length > 0) {
          result[e.key] = e.value;
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
      this.extraEntries[index].key = $event;
      this.updateValue();
    },
    handleDelete(index) {
      this.extraEntries.splice(index, 1);
      this.updateValue();
    },
    handleAdd() {
      if (!this.canAdd) return;
      let i = this.extraEntries.length;
      const newField = this.fields.find(f => !f.hidden) || { key: this.$t('plan.extra') + `${++i}` };
      let newKey = newField.key;
      while (Object.prototype.hasOwnProperty.call(this.value, newKey)) {
        newKey = this.$t('plan.extra') + `${++i}`;
      }
      this.extraEntries.push({ key: newKey, value: '' });
      this.updateValue();
    }
  },
  watch: {
    value() {
      if (!this.readonly) return;
      this.updateExtraEntries();
    }
  },
  created() {
    this.updateExtraEntries();
  }
};
</script>

<style>
.plan__extra .el-input-group--prepend .el-input-group__prepend {
  padding: 0 15px;
}
.plan__extra .el-input--suffix .el-input__inner {
  /* balance out nagetive margin of .el-input-group__prepend .el-select */
  padding: 10px 20px;
  width: 150px;
}
</style>
