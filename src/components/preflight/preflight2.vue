<template>
  <el-dialog
    width="500px"
    append-to-body
    custom-class="sd-preflight"
    :visible.sync="visible"
    :close-on-click-modal="false"
    @open="handleOpen"
    @closed="handleClosed"
  >
    <template #title>
      <span class="el-dialog__title">{{ form.name || $t('preflight.title') }}</span>
    </template>
    <div v-if="error.retry" class="sd-preflight__error">
      <div class="sd-preflight__error-icon el-icon-error color--red"></div>
      <div v-t="{ path: 'preflight.failed', args: { code: error.code } }"></div>
      <el-button size="medium" @click="handleRetry" v-t="'common.retry'"></el-button>
    </div>
    <div v-else v-loading="loading">
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
import { runPlan } from '@/api/super-dock';

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
    error: {
      code: 0,
      retry: false
    },
    loading: false,
    /** @type {SDWC.PreflightDialog} */
    form: {}
  }),
  methods: {
    onMsgDialog(dialog) {
      if (Object.getOwnPropertyNames(dialog).length === 0) {
        this.visible = false;
        return;
      }
      this.loading = false;
      this.form = dialog;
    },
    isPlanRunning() {
      // TODO: API
      return false;
    },
    runPlan() {
      if (!this.isPlanRunning()) {
        runPlan(this.planId).catch(e => {
          this.error.code = e.status;
          this.error.retry = true;
        });
      }
    },
    handleOpen() {
      this.runPlan();
      this.loading = true;
    },
    handleRetry() {
      this.error.retry = false;
      this.runPlan();
      this.loading = true;
    },
    handleClosed() {
      if (this.error.retry) {
        this.error = {
          code: 0,
          retry: false
        };
      }
    },
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
  created() {
    MqttClient.subscribePlanDialog(this.planId, this.onMsgDialog);
  },
  beforeDestroy() {
    MqttClient.unsubscribePlanDialog(this.planId, this.onMsgDialog);
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
