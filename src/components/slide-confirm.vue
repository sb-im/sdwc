<template>
  <div
    class="sd-slide-confirm"
    :class="containerClass"
    :style="containerStyle"
    @mouseup="handleMouseUp"
    @mousemove="handleMouseMove"
    @mouseleave="handleMouseLeave"
    @touchend="handleMouseUp"
    @touchmove="handleMouseMove"
  >
    <div class="sd-slide-confirm__text" :style="textStyle" v-t="text"></div>
    <el-button
      class="sd-slide-confirm__inner"
      ref="button"
      v-bind="buttonAttrs"
      :style="buttonStyle"
      @mousedown.native="activate"
      @touchstart.native="activate"
    ></el-button>
  </div>
</template>

<script>
export default {
  inheritAttrs: false,
  name: 'sd-slide-confirm',
  props: {
    width: {
      type: Number,
      default: 240
    },
    text: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      buttonWidth: 0,
      dragable: false,
      position: 0,
      initialX: 0,
      completed: false
    };
  },
  computed: {
    containerClass() {
      return {
        'sd-slide-confirm--completed': this.completed
      };
    },
    containerStyle() {
      return { width: `${this.width}px` };
    },
    textStyle() {
      return { visibility: this.position ? 'hidden' : 'visible' };
    },
    buttonAttrs() {
      return {
        ...this.$attrs,
        type: this.$attrs.disabled ? 'info' : this.completed ? 'success' : this.$attrs.type || 'primary',
        icon: this.completed ? 'el-icon-check' : this.$attrs.icon || 'el-icon-arrow-right'
      };
    },
    buttonStyle() {
      if (this.completed) return { marginLeft: `${this.completedPosition}px` };
      if (!this.dragable) return {};
      return {
        marginLeft: `${this.position}px`,
        transitionProperty: 'background-color',
      };
    },
    completedPosition() {
      return this.width - this.buttonWidth;
    }
  },
  methods: {
    /** @param {MouseEvent | TouchEvent} ev */
    activate(ev) {
      if (this.$attrs.disabled) return;
      ev.preventDefault();
      this.dragable = true;
      this.initialX = ev.screenX || ev.changedTouches[0].screenX;
      this.buttonWidth = this.$refs.button.$el.getBoundingClientRect().width;
    },
    deactivate() {
      this.position = 0;
      this.dragable = false;
      this.completed = false;
    },
    handleMouseUp() {
      if (this.position === this.completedPosition) {
        this.completed = true;
        this.$emit('confirm');
      } else {
        this.deactivate();
      }
    },
    handleMouseLeave() {
      if (this.completed) return;
      this.deactivate();
    },
    /** @param {MouseEvent | TouchEvent} ev */
    handleMouseMove(ev) {
      if (!this.dragable) {
        return;
      }
      ev.preventDefault();
      let pos = ev.screenX || ev.changedTouches[0].screenX;
      pos -= this.initialX;
      if (pos <= 0) {
        this.position = 0;
      } else if (pos > this.completedPosition) {
        this.position = this.completedPosition;
      } else {
        this.position = pos;
      }
    }
  }
};
</script>

<style>
.sd-slide-confirm {
  display: inline-block;
  position: relative;
  border-radius: 3px;
  transition-duration: 0.1s;
  color: #909399;
  background-color: #f4f4f5;
  box-shadow: inset 0 0 0 1px #d3d4d6;
}
.sd-slide-confirm--completed {
  color: #67c23a;
  background-color: #f0f9eb;
  box-shadow: inset 0 0 0 1px #c2e7b0;
}
.sd-slide-confirm__text {
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  font-size: 14px;
  user-select: none;
  pointer-events: none;
}
.sd-slide-confirm__inner {
  display: block;
}
.el-button + .sd-slide-confirm {
  margin-left: 10px;
}
</style>
