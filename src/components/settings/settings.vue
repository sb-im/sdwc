<template>
  <sd-card class="control settings" icon="gear" title="settings.title">
    <div
      v-loading="disabled"
      element-loading-custom-class="control--disable"
      element-loading-spinner="el-icon-warning-outline"
      :element-loading-text="disabledText"
    >
      <el-form inline size="mini">
        <div v-for="group in groups" :key="group.name">
          <el-divider v-if="groups.length > 1" content-position="left">{{ group.name }}</el-divider>
          <el-form-item v-for="item in group.item" :key="item.field" :label="$t(item.label)">
            <component
              :is="item.type"
              :disabled="pending[group.name][item.label]"
              v-bind="item"
              @change="handleChange(group, item, $event)"
            ></component>
          </el-form-item>
        </div>
      </el-form>
    </div>
  </sd-card>
</template>

<script>
import { get } from 'lodash';

import Card from '@/components/card.vue';

import Radio from './settings-radio.vue';
import Input from './settings-input.vue';
import Switch from './settings-switch.vue';
import Slider from './settings-slider.vue';

const ComponentName = {
  radio: Radio.name,
  input: Input.name,
  switch: Switch.name,
  slider: Slider.name,
};

export default {
  name: 'sd-node-settings',
  props: {
    point: {
      type: Object,
      required: true
    },
    status: {
      type: Object,
      required: true
    },
    msg: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      pending: {}
    };
  },
  computed: {
    /** @returns {boolean} */
    disabled() {
      return this.status.code !== 0;
    },
    /** @returns {string} */
    disabledText() {
      return this.$t('control.abnormal');
    },
    /** @returns {SDWC.SettingsGroup[]} */
    groups() {
      return this.point.params.map(group => {
        const pool = this.msg[group.topic] || {};
        return {
          name: group.name,
          method: group.method,
          item: group.item.map(item => ({
            ...item,
            type: ComponentName[item.type],
            value: get(pool, item.field)
          }))
        };
      });
    }
  },
  methods: {
    handleChange(group, item, value) {
      this.$set(this.pending[group.name], item.label, true);
      this.$mqtt(this.point.node_id, {
        mission: group.method || 'setparam',
        arg: { [item.label]: value }
      }).catch(() => { /* noop */ }).then(() => {
        this.$set(this.pending[group.name], item.label, false);
      });
    }
  },
  created() {
    this.ComponentName = ComponentName;
    for (const group of this.groups) {
      this.$set(this.pending, group.name, {});
      for (const item of group.item) {
        this.$set(this.pending[group.name], item.label, false);
      }
    }
  },
  components: {
    [Card.name]: Card,
    [Radio.name]: Radio,
    [Input.name]: Input,
    [Switch.name]: Switch,
    [Slider.name]: Slider,
  }
};
</script>

<style>
.settings .el-loading-parent--relative {
  /* make el-loading-mask cover first el-divider */
  padding-top: 1px;
}
.settings .settings__input.el-input {
  width: 120px;
}
.settings .el-slider {
  width: 180px;
}
.settings .el-divider {
  margin: 12px 0;
}
.settings .el-form-item {
  margin-bottom: 10px;
}
</style>
