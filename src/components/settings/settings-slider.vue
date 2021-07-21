<template>
  <el-slider
    class="settings__slider"
    :disabled="disabled"
    :min="range[0]"
    :max="range[1]"
    :step="step"
    :marks="marks"
    :show-input="true"
    :show-input-controls="false"
    :input-size="elFormItem.elFormItemSize"
    v-model="model"
    @change="handleChange"
  ></el-slider>
</template>

<script>
export default {
  name: 'sd-settings-slider',
  props: {
    label: {
      type: String,
      required: true
    },
    disabled: {
      type: Boolean,
      default: false
    },
    range: {
      type: Array,
      required: true
    },
    step: {
      type: Number,
      default: 1
    },
    value: {
      type: Number,
      default: 0
    }
  },
  data: () => ({
    model: null
  }),
  inject: {
    elFormItem: {
      default: {}
    }
  },
  computed: {
    marks() {
      return Object.fromEntries(this.range.map(v => [v, `${v}`]));
    }
  },
  methods: {
    handleChange(val) {
      this.$emit('change', val);
    }
  },
  watch: {
    value(newVal) {
      this.model = newVal;
    }
  },
  created() {
    this.model = this.value;
  }
};
</script>

<style>
.settings__slider {
  display: flex;
  align-items: center;
  flex-grow: 1;
  flex-direction: row-reverse;
}
.settings__slider::before,
.settings__slider::after {
  content: none;
  display: none;
}
.settings__slider .el-slider__runway {
  flex-grow: 1;
  margin: 0;
}
.settings__slider .el-slider__button-wrapper {
  top: -9px;
  width: 24px;
  height: 24px;
}
.settings__slider .el-slider__button {
  width: 12px;
  height: 12px;
}
.settings__slider .el-slider__marks {
  top: unset;
  left: unset;
  width: 100%;
  line-height: 14px;
}
.settings__slider .el-slider__marks-stop {
  display: none;
}
.settings__slider .el-slider__marks-text {
  font-size: 12px;
  margin-top: 0;
  top: 8px;
  -webkit-transform: none;
  transform: none;
}
.settings__slider .el-slider__marks-text:last-child {
  right: 0 !important;
  left: unset !important;
}
.settings__slider .el-input-number {
  float: none;
  position: static;
  display: block;
  margin-top: 0;
  margin-left: 6px;
  width: 50px;
}
.settings__slider .el-input__inner {
  padding: 0 !important;
}
</style>
