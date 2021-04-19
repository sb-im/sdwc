<template>
  <el-dialog
    width="500px"
    append-to-body
    custom-class="sd-plan-dialog"
    :title="form.name"
    :visible.sync="visible"
  >
    <el-alert
      v-if="form.message"
      show-icon
      :title="form.message"
      :type="alertType"
      :closable="false"
    ></el-alert>
    <template v-for="item of form.items">
      <sd-plan-dialog-item :key="item.name" :title="item.name" :level="item.level">
        <div>{{ item.message }}</div>
      </sd-plan-dialog-item>
    </template>
    <div slot="footer">
      <el-button
        v-for="button of form.buttons"
        :key="button.name"
        size="medium"
        :type="button.level"
        @click="handleButtonClick(button)"
      >{{ button.name }}</el-button>
    </div>
  </el-dialog>
</template>

<script>
import MqttClient from '@/api/mqtt';

import PlanDialogItem from './plan-dialog-item.vue';

export default {
  name: 'sd-plan-dialog',
  props: {
    planId: {
      type: Number,
      required: true
    }
  },
  data: () => ({
    visible: false
  }),
  computed: {
    form() {
      const d = this.$store.state.plan.dialog.find(d => d.id === this.planId) || {};
      return d.dialog || {};
    },
    alertType() {
      if (!this.form.level) return 'info';
      if (this.form.level === 'danger') return 'error';
      return this.form.level;
    }
  },
  methods: {
    /**
     * @param {{ name: string, message: string, level: string }} button
     */
    handleButtonClick(button) {
      MqttClient.mqtt.publish(`plans/${this.planId}/term`, button.message);
    },
    open() {
      this.visible = true;
    },
    close() {
      this.visible = false;
    }
  },
  components: {
    [PlanDialogItem.name]: PlanDialogItem
  }
};
</script>

<style>
.sd-plan-dialog .el-dialog__body {
  padding: 10px 20px 20px;
  box-sizing: content-box;
}
</style>
