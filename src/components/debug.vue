<template>
  <sd-card class="debug" icon="maintenance" title="debug.title">
    <div
      v-loading="disabled"
      element-loading-custom-class="control--disable"
      element-loading-spinner="el-icon-warning-outline"
      :element-loading-text="disabledText"
    >
      <el-form class="debug__form" inline>
        <el-form-item class="debug__method">
          <el-autocomplete
            class="debug__input"
            size="medium"
            placeholder="method"
            v-model="method"
            :fetch-suggestions="filterMethods"
          ></el-autocomplete>
        </el-form-item>
        <el-form-item class="debug__params">
          <el-input class="debug__input" size="medium" placeholder="params" v-model="params"></el-input>
        </el-form-item>
        <el-form-item class="control__buttons">
          <el-button size="medium" type="warning" v-loading="pending" @click="handleSend">
            <span v-t="'debug.send'"></span>
          </el-button>
        </el-form-item>
      </el-form>
      <div class="debug__recent">
        <div v-if="recent.length === 0" class="debug__empty">
          <el-button type="text" disabled v-t="'debug.no_recent'"></el-button>
        </div>
        <el-button v-for="r in recent" :key="r" size="medium" @click="handleRecent(r)">{{ r }}</el-button>
      </div>
    </div>
  </sd-card>
</template>

<script>
import Card from '@/components/card.vue';
import Icon from '@/components/sd-icon.vue';

export default {
  name: 'sd-node-debug',
  inheritAttrs: false,
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
      pending: false,
      method: '',
      params: '',
      recent: []
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
      return this.point.name.trim().split(' ').filter(c => c !== '').map(value => ({ value }));
    }
  },
  methods: {
    /**
     * @param {string} query
     * @param {(data: {value: string}[]) => void} callback
     */
    filterMethods(query, callback) {
      if (query.length === 0) {
        callback(this.commands);
      } else {
        const filtered = this.commands.filter(c => c.value.includes(query));
        callback(filtered.length > 0 ? filtered : this.commands);
      }
    },
    addRecent(method) {
      const i = this.recent.findIndex(v => v === method);
      if (i >= 0) {
        this.recent.splice(i, 1);
      }
      this.recent.unshift(method);
      if (this.recent.length > 5) {
        this.recent.splice(5, this.recent.length - 5);
      }
    },
    handleSend() {
      const method = this.method.trim();
      if (!method) return;
      let params = [];
      if (this.params.length > 0) {
        try {
          params = JSON.parse(this.params);
        } catch (e) {
          params = this.params.split(' ');
        }
      }
      this.addRecent(method);
      this.pending = true;
      this.$mqtt(this.point.node_id, { mission: method, arg: params })
        .catch(() => { /* noop */ })
        .then(() => this.pending = false);
    },
    handleRecent(c) {
      this.method = c;
    },
    /**
     * @param {KeyboardEvent} e
     */
    onKeyPress(e) {
      if (e.keyCode === 13 || e.key === 'Enter') {
        this.handleSend();
      }
    }
  },
  mounted() {
    const inputs = this.$el.querySelectorAll('input.el-input__inner');
    inputs.forEach(i => i.addEventListener('keypress', this.onKeyPress));
  },
  beforeDestroy() {
    const inputs = this.$el.querySelectorAll('input.el-input__inner');
    inputs.forEach(i => i.removeEventListener('keypress', this.onKeyPress));
  },
  components: {
    [Card.name]: Card,
    [Icon.name]: Icon
  }
};
</script>

<style>
.debug__form {
  display: flex;
}
.debug .el-form-item {
  margin-bottom: 10px;
}
.debug .el-form-item:last-child {
  margin-right: 0;
}
.debug__form .el-form-item__content,
.debug__input {
  width: 100%;
}
.debug__input .el-input__inner {
  font-family: monospace;
}
.debug__method {
  width: 50%;
}
.debug__params {
  flex-grow: 1;
}
.debug__empty {
  height: 36px;
  line-height: 36px;
  font-size: 14px;
}
.debug__recent {
  display: flex;
  flex-wrap: nowrap;
  overflow: hidden;
}
</style>
