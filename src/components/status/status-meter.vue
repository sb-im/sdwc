<template>
  <div class="status__line" :style="lineStyle">
    <div
      v-for="item of items"
      :key="item.name"
      class="status__item"
      :class="{ expandable: item.popover, active: popover.show && popover.type === item.popover }"
      @click.stop="triggerPopover(item.popover, $event)"
    >
      <sd-icon :value="item.icon" :size="18"></sd-icon>
      <span class="status__text">
        <span v-if="item.name" v-t="item.name"></span>
        <span>&#32;{{ item.value }}{{ item.unit || '' }}</span>
      </span>
      <i v-if="item.popover" class="el-icon-arrow-down el-icon--right"></i>
    </div>
    <el-popover
      ref="popover"
      trigger="manual"
      style="display:none"
      popper-class="status__popover"
      v-model="popover.show"
    >
      <slot name="popover">
        <span>{{ popover.type }}</span>
      </slot>
    </el-popover>
  </div>
</template>

<script>
import Icon from '@/components/sd-icon.vue';

export default {
  name: 'sd-status-meter',
  props: {
    items: {
      type: Array,
      required: true
    }
  },
  data: () => ({
    popover: {
      show: false,
      type: ''
    }
  }),
  computed: {
    lineStyle() {
      const l = this.items.length;
      return l === 8 ? '' : `--status-count:${l}`;
    }
  },
  methods: {
    closePopover() {
      this.popover.show = false;
      this.$emit('popover', false);
      clearTimeout(this.chargerInfoInterval);
      this.chargerInfoInterval = 0;
    },
    /**
     * @param {string} type
     * @param {MouseEvent} event
     */
    triggerPopover(type, event) {
      if (!type) return;
      if (this.popover.type === type && this.popover.show === true) {
        this.closePopover();
        return;
      }
      this.$emit('popover', true, type);
      this.popover.type = type;
      const elm = event.target.closest('.status__item');
      if (!this.$refs.popover.popperJS) {
        this.$refs.popover.referenceElm = elm;
        this.popover.show = true;
      } else if (this.popover.show) {
        this.$refs.popover.popperJS._reference = elm;
        this.$refs.popover.updatePopper();
      } else {
        this.popover.show = true;
      }
    },
    handleDocumentClick(e) {
      if (!this.popover.show || this.$refs.popover.referenceElm.contains(e.target)) return;
      this.closePopover();
    }
  },
  mounted() {
    window.document.addEventListener('click', this.handleDocumentClick);
  },
  beforeDestroy() {
    window.document.removeEventListener('click', this.handleDocumentClick);
  },
  components: {
    [Icon.name]: Icon
  }
};
</script>

<style>
.status__item {
  flex-basis: calc(100% / var(--status-count, 8));
  box-sizing: border-box;
  padding: 20px 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.status__text {
  margin-left: 4px;
}
.status__item.expandable {
  padding: 20px 10px;
  user-select: none;
  cursor: pointer;
  transition: background-color 0.3s;
}
.status__item.expandable [class^='el-icon-'] {
  margin-left: auto;
}
.status__item.active {
  background-color: #00000014;
}
/* popover */
.status__popover {
  width: 420px;
}
</style>
