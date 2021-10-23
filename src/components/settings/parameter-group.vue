<template>
  <el-form label-position="left" label-width="100px" size="small">
    <el-divider v-if="label" content-position="left">{{ label }}</el-divider>
    <p v-if="description" class="parameter-group__desc" v-text="description"></p>
    <template v-for="(item, key) of items">
      <!-- recursive render group in group -->
      <sd-node-parameter-group
        v-if="item.type === $options.name"
        :key="key"
        :value.sync="value[key]"
        v-bind="item"
        @change="handleChange(key, $event)"
      ></sd-node-parameter-group>
      <el-form-item v-else :key="key" :label="$t(item.label)">
        <component
          :is="item.type"
          :value.sync="value[key]"
          v-bind="item"
          @change="handleChange(key, $event)"
        ></component>
        <p class="parameter__desc" v-text="item.description"></p>
      </el-form-item>
    </template>
  </el-form>
</template>

<script>
import Radio from './settings-radio.vue';
import Input from './settings-input.vue';
import Switch from './settings-switch.vue';
import Slider from './settings-slider.vue';

export default {
  name: 'sd-node-parameter-group',
  props: {
    label: {
      type: String
    },
    description: {
      type: String
    },
    /** @type {Vue.PropOptions<{ [key: string]: SDWC.NodeParameterType }>} */
    items: {
      type: Object,
      default: () => { }
    },
    value: {
      type: Object,
      default: () => { }
    }
  },
  methods: {
    /**
     * @param {string} key
     * @param {any} value
     */
    handleChange(key, value) {
      const newValue = {
        ...this.value,
        [key]: value
      };
      this.$emit('update:value', newValue);
    }
  },
  components: {
    [Radio.name]: Radio,
    [Input.name]: Input,
    [Switch.name]: Switch,
    [Slider.name]: Slider
  }
};
</script>

<style>
.parameter__body .el-divider {
  margin: 24px 0 16px;
}
.parameter-group__desc {
  font-size: 12px;
  line-height: 16px;
  margin: 0 0 18px;
}
.parameter__desc {
  font-size: 12px;
  line-height: 16px;
  margin: 6px 0 0;
}
</style>
