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
      <el-form label-position="left" label-width="100px" size="small">
        <el-form-item v-for="(item, key) of items" :key="key" :label="$t(item.label)">
          <component
            :is="Compo[item.type]"
            :disabled="pending[key]"
            :value="item.value"
            v-bind="item"
            @change="handleChange(item, key, $event)"
          ></component>
          <p class="parameter__desc" v-text="item.description"></p>
        </el-form-item>
      </el-form>
    </div>
  </el-dialog>
</template>

<script>
import Radio from './settings-radio.vue';
import Input from './settings-input.vue';
import Switch from './settings-switch.vue';
import Slider from './settings-slider.vue';

const Compo = {
  radio: Radio.name,
  input: Input.name,
  switch: Switch.name,
  slider: Slider.name
};

export default {
  name: 'sd-node-parameters',
  props: {
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
      items: {},
      pending: {}
    };
  },
  computed: {
    disabled() {
      return this.statusCode !== 0 || this.fetching;
    },
    disabledIcon() {
      return this.statusCode === 0 ? null : 'el-icon-warning-outline';
    },
    disabledText() {
      return this.statusCode === 0 ? null : this.$t('control.abnormal');
    }
  },
  methods: {
    async fetchParameters() {
      const keys = this.point.params || [];
      if (keys.length <= 0) return;
      this.fetching = true;
      const [params, types] = await Promise.all([
        this.$mqtt(this.point.node_id, { mission: 'get_parameter', arg: keys }),
        this.$mqtt(this.point.node_id, { mission: 'get_parameter_type', arg: keys })
      ]);
      for (const [key, val] of Object.entries(types)) {
        this.$set(this.pending, key, false);
        val.value = params[key];
        switch (val.type) {
          case 'enum':
            val.type = 'radio';
            val.values = val.type_param;
            break;
          case 'string':
            val.type = 'input';
            break;
          case 'float':
            val.value = Number.parseFloat(val.value) || 0;
            if (Array.isArray(val.type_param)) {
              val.type = 'slider';
              val.range = val.type_param;
              val.step = 1;
            } else {
              val.type = 'input';
            }
            break;
          case 'bool':
            val.type = 'switch';
            break;
        }
      }
      this.items = types;
      this.fetching = false;
    },
    async refreshValues() {
      const keys = this.point.params || [];
      if (keys.length <= 0) return;
      this.fetching = true;
      const params = await this.$mqtt(this.point.node_id, { mission: 'get_parameter', arg: keys });
      for (const [key, val] of Object.entries(params)) {
        const item = this.items[key];
        if (item) {
          item.value = val;
        }
      }
      this.fetching = false;
    },
    handleChange(item, key, value) {
      this.$set(this.pending, key, true);
      this.$mqtt(this.point.node_id, {
        mission: 'set_parameter',
        arg: { [key]: value }
      }).catch(e => {
        this.$message.error(this.$t('status.set_param_failed', e));
      }).then(() => {
        this.$set(this.pending, key, false);
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
      this.items = [];
    }
  },
  created() {
    this.Compo = Compo;
  },
  components: {
    [Radio.name]: Radio,
    [Input.name]: Input,
    [Switch.name]: Switch,
    [Slider.name]: Slider,
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
.parameter__desc {
  font-size: 12px;
  line-height: 16px;
  margin: 6px 0 0;
}
</style>
