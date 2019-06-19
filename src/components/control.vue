<template>
  <sd-card class="control" icon="airport/a_h_control" :title="$t('common.advanced_control')">
    <div
      class="control__body"
      v-loading="disabled"
      element-loading-spinner="el-icon-warning-outline"
      :element-loading-text="$t('common.not_operational')"
    >
      <div class="control__group" v-for="group in controls" :key="group.icon">
        <sd-icon :value="group.icon" :size="36"></sd-icon>
        <div v-for="ctl in group.item" :key="ctl.name">
          <el-button
            size="medium"
            :type="ctl.type || 'warning'"
            @click="handleControl(ctl)"
          >{{ $t(ctl.name, ctl.values) }}</el-button>
        </div>
      </div>
      <el-collapse class="control__collapse">
        <el-collapse-item :title="$t('common.debug_tips')" name="cmd-input">
          <el-input class="control__input" ref="inputCommand" v-model="command">
            <template #append>
              <el-button @click="handleCmdSend">{{ $t('common.send') }}</el-button>
            </template>
          </el-input>
        </el-collapse-item>
      </el-collapse>
    </div>
  </sd-card>
</template>

<script>
import Card from '@/components/card.vue';
import Icon from '@/components/sd-icon.vue';

/**
 * @typedef {import('element-ui/types/button').ButtonType} ButtonType
 * @typedef {import('@/index').SDWC.ControlItem} ControlItem
 * custom control group
 * @type {{ icon: string, item: ControlItem[] }[]}
 */
const Controls = [
  {
    icon: 'airport/a_reset',
    item: [
      { name: 'depot.emergency_stop', mission: 'stop', type: 'danger' },
      { name: 'depot.air_reset', mission: 'reset' }
    ]
  }
];

export default {
  props: {
    node: {
      type: Object,
      required: true
    },
    status: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      command: ''
    };
  },
  computed: {
    disabled() {
      return this.status !== 0;
    },
    controls() {
      return Controls;
    }
  },
  methods: {
    /**
     * @param {ControlItem} ctl
     */
    handleControl(ctl) {
      this.$mqtt(this.node.id, ctl).catch(() => { /* noop */ });
    },
    handleCmdSend() {
      const [mission, ...arg] = this.command.split(' ');
      this.command = '';
      this.handleControl({ mission, arg });
    }
  },
  mounted() {
    const inputCommand = this.$refs.inputCommand.$el.getElementsByTagName('input')[0];
    if (inputCommand) {
      inputCommand.addEventListener('keypress', (ev) => {
        if (ev.keyCode === 13 || ev.key === 'Enter') {
          this.handleCmdSend();
        }
      });
    }
  },
  components: {
    [Card.name]: Card,
    [Icon.name]: Icon
  }
};
</script>

<style>
.control__body {
  display: flex;
  flex-wrap: wrap;
}
.control__group {
  margin-right: 16px;
  height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
}
.control__body .el-loading-mask {
  transition: opacity 0s;
  user-select: none;
  cursor: not-allowed;
}
.control .el-card__body {
  padding-bottom: 0;
}
.control__collapse {
  min-width: 100%;
}
.control .el-collapse,
.control .el-collapse-item__header,
.control .el-collapse-item__wrap {
  border: none;
}
.control .el-collapse-item:last-child {
  margin-bottom: unset;
}
.control__input {
  width: 500px;
}
.control__input .el-input__inner {
  font-family: monospace;
}
</style>
