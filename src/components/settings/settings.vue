<template>
  <sd-card class="control settings" icon="gear" title="settings.title">
    <div
      v-loading="disabled"
      element-loading-custom-class="control--disable"
      element-loading-spinner="el-icon-warning-outline"
      :element-loading-text="disabledText"
    >
      <el-form inline>
        <div v-for="group in groups" :key="group.name">
          <el-divider v-if="groups.length > 1" content-position="left">{{ group.name }}</el-divider>
          <el-form-item v-for="item in group.item" :key="item.field" :label="$t(item.label)">
            <component
              :is="ComponentName[item.type]"
              :value="item.value"
              v-bind="item"
              @change="handleChange(item, $event)"
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
      radio: 'B',
      pending: {}
    };
  },
  computed: {
    disabled() {
      return this.status.code !== 0;
    },
    disabledText() {
      return this.$t('control.abnormal');
    },
    groups() {
      return this.point.params.map(group => {
        const pool = this.msg[group.topic] || {};
        return {
          name: group.name,
          item: group.item.map(item => ({
            ...item,
            value: get(pool, item.field)
          }))
        };
      });
    }
  },
  methods: {
    getFieldValue(field) {
      return get(this.pool, field);
    },
    handleChange(item, value) {
      this.$mqtt(this.point.node_id, {
        mission: 'setparam',
        arg: { [item.label]: value }
      }).catch(() => { /* noop */ });
    }
  },
  created() {
    this.ComponentName = ComponentName;
  },
  mounted() {
    for (const group of this.groups) {
      for (const item of group.item) {
        this.$set(this.pending, item.field, false);
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
.settings .el-divider {
  margin: 12px 0;
}
.settings .el-form-item {
  margin-bottom: 10px;
}
</style>
