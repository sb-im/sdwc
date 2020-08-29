<template>
  <el-dialog
    width="500px"
    append-to-body
    custom-class="sd-preflight"
    :visible.sync="visible"
  >
    <template #title>
      <span class="el-dialog__title">{{ form.name || $t('preflight.title') }}</span>
    </template>
    <div v-loading="loading">
      <el-alert
        v-if="form.level"
        :title="form.message"
        :type="form.level"
        show-icon
        :closable="false"
      ></el-alert>
      <template v-for="item of form.items">
        <sd-preflight-item :key="item.name" :title="item.name" :level="item.level">
          <div>{{ item.message }}</div>
        </sd-preflight-item>
      </template>
    </div>
    <template #footer>
      <el-button
        v-for="button of form.buttons"
        :key="button.name"
        size="medium"
        :type="button.level"
        @click="handleButtonClick(button)"
      >{{ button.name }}</el-button>
    </template>
  </el-dialog>
</template>

<script>
import MqttClient from '@/api/mqtt';

import PreflightItem from './preflight-item.vue';

export default {
  name: 'sd-preflight',
  props: {
    planId: {
      type: Number,
      required: true
    }
  },
  data: () => ({
    visible: false,
    loading: false
  }),
  computed: {
    form() {
      const d = this.$store.state.plan.dialog.find(d => d.id === this.planId) || {};
      return d.dialog || {};
    }
  },
  methods: {
    /**
     * @param {{ name: string, message: string, level: string }} button
     */
    handleButtonClick(button) {
      this.loading = true;
      MqttClient.mqtt.publish(`plans/${this.planId}/term`, button.message, () => this.loading = false);
    },
    toggle() {
      this.visible = !this.visible;
    }
  },
  watch: {
    form(value) {
      if (this.visible && Object.getOwnPropertyNames(value).length === 0) {
        this.visible = false;
      }
    }
  },
  components: {
    [PreflightItem.name]: PreflightItem
  }
};
</script>

<style>
.sd-preflight .el-dialog__body {
  padding: 10px 20px 20px;
  min-height: 300px;
  box-sizing: content-box;
}
.sd-preflight .el-loading-parent--relative {
  min-height: 260px;
}

.sd-preflight__error {
  height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-evenly;
}
.sd-preflight__error-icon {
  font-size: 60px;
}
</style>
