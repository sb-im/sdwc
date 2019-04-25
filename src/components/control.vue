<template>
  <div class="sd-control">
    <el-card shadow="never">
      <template #header>
        <div class="sd-node-card__head">
          <sd-icon value="airport/a_h_control" :size="36"></sd-icon>
          <span class="sd-node-card__title">{{ $t('common.advanced_control') }}</span>
        </div>
      </template>

      <div class="sd-control-body">
        <div
          class="sd-control-group"
          v-for="group in controls"
          :key="group.icon"
        >
          <sd-icon :value="group.icon" :size="36"></sd-icon>
          <div v-for="ctl in group.item" :key="ctl.name">
            <el-button
              size="medium"
              :type="ctl.type || 'warning'"
              @click="handleControl(ctl)"
            >{{ $t(ctl.name, ctl.values) }}</el-button>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import MqttClient from '@/api/mqtt';
import Icon from '@/components/sd-icon.vue';

// custom control group
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
  computed: {
    controls() {
      return Controls;
    }
  },
  methods: {
    checkNodeStatus() {
      if (this.status == 0) {
        return true;
      }
      this.$alert(this.$t('common.not_operational'), {
        type: 'warning',
        title: this.$t('common.system_tips')
      });
      return false;
    },
    handleControl({ name, values, mission }) {
      if (!this.checkNodeStatus()) {
        return;
      }
      const notification = this.$notify({
        duration: 0,
        type: 'info',
        title: this.$t(name, values),
        message: this.$t('common.operate_pending')
      });
      MqttClient.invoke(this.node.id, mission, {})
        .then(() => {
          notification.$data.type = 'success';
          notification.$data.message = this.$t('common.operate_success');
          notification.$data.duration = 2000;
          notification.startTimer();
        })
        .catch(() => {
          notification.$data.type = 'error';
          notification.$data.message = this.$t('common.operate_error');
        });
    }
  },
  components: {
    [Icon.name]: Icon
  }
};
</script>

<style>
.sd-control-body {
  display: flex;
}
.sd-control-group {
  margin-right: 16px;
  height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
}
</style>
