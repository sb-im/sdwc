<template>
  <sd-card class="debug" icon="maintenance" :title="$t('common.debug')">
    <div
      v-loading="disabled"
      element-loading-spinner="el-icon-warning-outline"
      :element-loading-text="$t('common.not_operational')"
    >
      <div class="debug__control">
        <el-button
          v-for="ctl in controls"
          :key="ctl"
          size="medium"
          type="warning"
          @click="handleControl(ctl)"
        >{{ ctl }}</el-button>
      </div>
      <el-input class="debug__input" size="medium" ref="inputCommand" v-model="command">
        <template #append>
          <el-button @click="handleCmdSend">{{ $t('common.send') }}</el-button>
        </template>
      </el-input>
    </div>
  </sd-card>
</template>

<script>
import Card from '@/components/card.vue';
import Icon from '@/components/sd-icon.vue';

export default {
  name: 'sd-node-debug',
  props: {
    point: {
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
      return this.point.name.split(' ');
    }
  },
  methods: {
    handleControl(ctl, arg) {
      this.$mqtt(this.point.node_id, { mission: ctl, arg }).catch(() => { /* noop */ });
    },
    handleCmdSend() {
      const [mission, ...arg] = this.command.split(' ');
      this.handleControl(mission, arg);
      this.command = '';
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
.debug__control {
  margin-bottom: 10px;
  margin-right: 10px;
}
.debug__input {
  width: 500px;
}
.debug__input .el-input__inner {
  font-family: monospace;
}
</style>
