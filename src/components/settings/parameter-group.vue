<template>
  <el-form label-position="left" label-width="100px" size="small">
    <el-divider v-if="label" content-position="left">{{ label }}</el-divider>
    <p v-if="description" class="parameter-group__desc" v-text="description"></p>
    <template v-for="(item, key) of items">
      <!-- recursive render group in group -->
      <sd-node-parameter-group
        v-if="item.type === $options.name"
        :key="key"
        :value="value[key]"
        v-bind="item"
        @change="handleChange(key, $event)"
      ></sd-node-parameter-group>
      <!-- render signle item -->
      <el-form-item v-else :key="key" :label="$t(item.label)">
        <component
          :is="item.type"
          :value="value[key]"
          v-bind="item"
          @change="handleChange(key, $event)"
        ></component>
        <p class="parameter__desc" v-text="item.description"></p>
      </el-form-item>
      <!-- only show save button in root group -->
      <el-button
        v-if="root"
        :key="key + '_btn'"
        circle
        size="small"
        :type="changed[key] ? 'primary' : ''"
        icon="el-icon-check"
        style="float:right"
        :disabled="!changed[key]"
        @click="handleSave(key)"
      ></el-button>
    </template>
    <el-divider v-if="label" class="parameter__bottom"></el-divider>
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
      default: () => ({})
    },
    value: {
      type: Object,
      default: () => ({})
    },
    root: {
      type: Boolean,
      default: false
    }
  },
  data: () => ({
    changed: {}
  }),
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
      // sync input value to parent component
      this.$emit('update:value', newValue);
      if (this.root) {
        // only root group should track parameter changed status
        this.$set(this.changed, key, true);
      } else {
        // non-root group should inform parent component its value has changed,
        // like an input component
        this.$emit('change', newValue);
      }
    },
    /**
     * @param {string} key
     */
    handleSave(key) {
      if (this.root) {
        // only root group should track parameter changed status
        this.$set(this.changed, key, false);
      }
      this.$emit('save', key, this.value[key]);
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
  margin: 16px 0;
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
.parameter__body .el-form-item,
.parameter__body .el-form .el-form {
  display: inline-block;
  width: 400px;
  margin-bottom: 10px;
}
.parameter__body .parameter__bottom {
  margin-top: 0;
}
</style>
