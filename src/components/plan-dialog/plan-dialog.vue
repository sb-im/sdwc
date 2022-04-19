<template>
  <el-dialog
    width="500px"
    append-to-body
    custom-class="sd-plan-dialog"
    :title="form.name"
    :visible.sync="visible"
  >
    <p class="navigate">
      <span v-t="'plan.dialog.running'"></span>
      <router-link :to="planRoute" v-slot="{ href }">
        <el-link v-text="plan.info.name" :href="href" @click.native="handleRouteClick"></el-link>
      </router-link>
    </p>
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
    /** @returns {SDWC.PlanState[]} */
    plans() { return this.$store.state.plan; },
    /** @returns {SDWC.PlanState} */
    plan() {
      return this.plans.find(p => p.info.id === this.planId);
    },
    /** @returns {import('vue-router').Route} */
    planRoute() {
      return { name: 'plan', params: { id: this.planId } };
    },
    /** @returns {SDWC.PlanDialogContent} */
    form() {
      return this.plan?.dialog ?? {};
    },
    /** @returns {string} */
    alertType() {
      if (!this.form.level) return 'info';
      if (this.form.level === 'danger') return 'error';
      return this.form.level;
    }
  },
  methods: {
    handleRouteClick() {
      this.$router.push(this.planRoute).catch(() => { /* noop */ });
      this.close();
    },
    /**
     * @param {{ name: string, message: string, level: string }} button
     */
    handleButtonClick(button) {
      MqttClient.respond(this.planId, button.message);
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
.sd-plan-dialog .navigate {
  margin: 0 0 1em;
}
.sd-plan-dialog .navigate .el-link {
  vertical-align: baseline;
}
</style>
