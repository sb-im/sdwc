<template>
  <el-dialog
    top="70px"
    width="500px"
    custom-class="sd-node-parameters"
    append-to-body
    :title="$t('status.parameters')"
    :visible.sync="visible"
    :close-on-click-modal="false"
    @open="fetchParameters"
    @closed="handleClosed"
  >
    <div
      class="parameter__body"
      v-loading="disabled"
      :element-loading-spinner="disabledIcon"
      :element-loading-text="disabledText"
    >
      <sd-node-parameter-group :items="types" :value.sync="values"></sd-node-parameter-group>
    </div>
    <template #footer>
      <el-button size="small" @click="close" v-t="'common.cancel'"></el-button>
      <el-button
        type="primary"
        size="small"
        :disabled="disabled"
        @click="handleSave"
        v-t="'common.save'"
      ></el-button>
    </template>
  </el-dialog>
</template>

<script>
import Radio from './settings-radio.vue';
import Input from './settings-input.vue';
import Switch from './settings-switch.vue';
import Slider from './settings-slider.vue';
import Group from './parameter-group.vue';

export default {
  name: 'sd-node-parameters',
  props: {
    /** @type {Vue.PropOptions<SDWC.NodePoint>} */
    point: {
      type: Object,
      required: true
    },
    statusCode: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      visible: false,
      fetching: true,
      /** @type {{ [key: string]: SDWC.NodeParameterType }} */
      types: {},
      /** @type {{ [key: string]: any }} */
      values: {}
    };
  },
  computed: {
    /** @returns {boolean} */
    disabled() {
      return this.statusCode !== 0 || this.fetching;
    },
    /** @returns {string} */
    disabledIcon() {
      return this.statusCode === 0 ? null : 'el-icon-warning-outline';
    },
    /** @returns {string} */
    disabledText() {
      return this.statusCode === 0 ? null : this.$t('control.abnormal');
    }
  },
  methods: {
    /**
     * @param {SDWC.NodeParameterTypesRaw}
     * @returns {{ [key: string]: SDWC.NodeParameterType }}
     */
    normalizeTypes(types) {
      const result = {};
      for (const [key, item] of Object.entries(types)) {
        /** @type {SDWC.NodeParameterType} */
        let r = {
          label: item.label,
          description: item.description
        };
        switch (item.type) {
          case 'enum':
            r.type = Radio.name;
            r.values = item.type_param;
            break;
          case 'string':
            r.type = Input.name;
            break;
          case 'float':
            if (Array.isArray(item.type_param)) {
              r.type = Slider.name;
              r.range = item.type_param;
              r.step = 1;
            } else {
              r.type = Input.name;
            }
            break;
          case 'bool':
            r.type = Switch.name;
            break;
          case 'group':
            r.type = Group.name;
            r.items = this.normalizeTypes(item.type_param);
            break;
        }
        result[key] = r;
      }
      return result;
    },
    async fetchParameters() {
      const keys = this.point.params || [];
      if (keys.length <= 0) return;
      this.fetching = true;
      /** @type {[ {[k: string]: any}, SDWC.NodeParameterTypesRaw ]} */
      const [values, types] = await Promise.all([
        this.$mqtt(this.point.node_id, { mission: 'get_parameter', arg: keys }),
        this.$mqtt(this.point.node_id, { mission: 'get_parameter_type', arg: keys })
      ]);
      this.types = this.normalizeTypes(types);
      this.values = values;
      this.fetching = false;
    },
    async refreshValues() {
      const keys = this.point.params || [];
      if (keys.length <= 0) return;
      this.fetching = true;
      const values = await this.$mqtt(this.point.node_id, { mission: 'get_parameter', arg: keys });
      this.values = values;
      this.fetching = false;
    },
    handleSave() {
      this.fetching = true;
      this.$mqtt(this.point.node_id, {
        mission: 'set_parameter',
        arg: this.values
      }).catch(e => {
        this.$message.error(this.$t('status.set_param_failed', e));
      }).then(() => {
        this.fetching = false;
        this.refreshValues();
      });
    },
    open() {
      this.visible = true;
    },
    close() {
      this.visible = false;
    },
    handleClosed() {
      this.types = {};
      this.values = {};
    }
  },
  components: {
    [Group.name]: Group
  }
};
</script>

<style>
.sd-node-parameters .el-dialog__body {
  max-height: min(600px, calc(100vh - 240px));
  overflow-y: auto;
}
.parameter__body {
  min-height: 400px;
}
</style>
