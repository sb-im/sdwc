<template>
  <sd-card class="debug" icon="maintenance" title="debug.title">
    <div
      v-loading="disabled"
      element-loading-custom-class="control--disable"
      element-loading-spinner="el-icon-warning-outline"
      :element-loading-text="disabledText"
    >
      <!-- button controls -->
      <div class="debug__control control__buttons">
        <el-button
          v-for="c in commands"
          :key="c"
          size="medium"
          type="warning"
          :disabled="pending[c]"
          v-loading="pending[c]"
          @click="handleCmd(c)"
        >{{ c }}</el-button>
      </div>
      <!-- command input -->
      <el-form class="debug__form" inline>
        <el-form-item class="debug__mission">
          <el-input class="debug__input" size="medium" placeholder="mission" v-model="mission"></el-input>
        </el-form-item>
        <el-form-item class="debug__arg">
          <el-input class="debug__input" size="medium" placeholder="arg (JSON)" v-model="arg"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button size="medium" type="primary" @click="handleSend" v-t="'debug.send'"></el-button>
        </el-form-item>
      </el-form>
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
      type: Object,
      required: true
    }
  },
  data() {
    return {
      pending: {},
      mission: '',
      arg: ''
    };
  },
  computed: {
    disabled() {
      return this.status.code !== 0;
    },
    disabledText() {
      return this.$t('control.abnormal');
    },
    commands() {
      return this.point.name.trim().split(' ').filter(c => c !== '');
    }
  },
  methods: {
    /**
     * @param {string} mission
     * @param {any} arg
     */
    handleCmd(mission, arg) {
      this.$set(this.pending, mission, true);
      this.$mqtt(this.point.node_id, { mission, arg })
        .catch(() => { /* noop */ })
        .then(() => this.$set(this.pending, mission, false));
    },
    handleSend() {
      const mission = this.mission.trim();
      if (!mission) return;
      let arg = [];
      try {
        arg = JSON.parse(this.arg);
      } catch(e) {
        arg = this.arg.split(' ');
      }
      this.handleCmd(mission, arg);
    }
  },
  created() {
    for (const it of this.commands) {
      this.$set(this.pending, it, false);
    }
  },
  mounted() {
    const inputs = this.$el.querySelectorAll('input.el-input__inner');
    inputs.forEach(i => {
      i.addEventListener('keypress', (ev) => {
        if (ev.keyCode === 13 || ev.key === 'Enter') {
          this.handleSend();
        }
      });
    });
  },
  components: {
    [Card.name]: Card,
    [Icon.name]: Icon
  }
};
</script>

<style>
.debug__control {
  margin-right: 10px;
}
.debug__control .el-button {
  margin: 0 6px 6px 0;
}
.debug__form {
  display: flex;
}
.debug .el-form-item {
  margin: 0 6px 6px 0;
}
.debug .el-form-item:last-child {
  margin-right: 0;
}
.debug__mission {
  width: 175px;
}
.debug__arg {
  flex-grow: 1;
}
.debug__arg .el-form-item__content {
  width: 100%;
}
.debug__input .el-input__inner {
  font-family: monospace;
}
</style>
