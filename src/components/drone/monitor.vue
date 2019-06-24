<template>
  <sd-node-monitor :point="point">
    <template>
      <div class="monitor-drone-control">
        <div class="monitor-drone-control--horizontal">
          <!-- pitch angle right -->
          <el-radio-group v-model="gimbal.mode" @change="handleGimbalMode" size="mini">
            <el-radio-button label="mavlink">{{ $t('air.gimbal_mode_mavlink') }}</el-radio-button>
            <el-radio-button label="neutral">{{ $t('air.gimbal_mode_neutral') }}</el-radio-button>
            <el-radio-button label="rc">{{ $t('air.gimbal_mode_rc') }}</el-radio-button>
          </el-radio-group>
          <el-slider
            v-model="gimbal.yaw"
            :max="90"
            :min="-90"
            :disabled="gimbalDisabled"
            @change="handleGimbalCtl('yaw', $event)"
            style="width:180px"
          />
        </div>
        <div class="monitor-drone-control--vertical">
          <!-- pitch angle left -->
          <el-slider
            vertical
            v-model="gimbal.pitch"
            :max="45"
            :min="-90"
            :disabled="gimbalDisabled"
            @change="handleGimbalCtl('pitch', $event)"
            height="135px"
          />
        </div>
      </div>
    </template>
  </sd-node-monitor>
</template>

<script>
import Monitor from '@/components/monitor/monitor.vue';

export default {
  name: 'sd-node-mointor-drone',
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
      gimbal: {
        mode: '',
        yaw: 0,
        pitch: 0
      }
    };
  },
  computed: {
    gimbalDisabled() {
      return this.status != 0 || this.gimbal.mode !== 'mavlink';
    },
  },
  methods: {
    handleGimbalMode(mode) {
      this.gimbal.mode = '';
      this.$mqtt(this.point.node_id, {
        name: `air.gimbal_mode_${mode}`,
        mission: 'gimbalmode',
        arg: [mode]
      }).then(() => {
        this.gimbal.mode = mode;
      });
    },
    handleGimbalCtl(prop, value) {
      const { yaw, pitch } = this.gimbal;
      this.$mqtt(this.point.node_id, {
        name: this.$t('air.pitch_angle'),
        mission: 'gimbal',
        arg: { yaw, pitch, [prop]: value }
      });
    }
  },
  components: {
    [Monitor.name]: Monitor
  }
};
</script>

<style>
.monitor-drone-control {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
}
.monitor-drone-control--horizontal {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-left: 5px;
  margin-right: 38px;
}
.monitor-drone-control--vertical {
  display: flex;
  justify-content: flex-end;
}
</style>
