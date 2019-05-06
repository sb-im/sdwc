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
    handleControl(ctl) {
      this.$mqtt(this.node.id, ctl).catch(() => { /* noop */ });
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
