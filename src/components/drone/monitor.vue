<template>
  <sd-node-monitor :point="point">
    <template #action>
      <el-radio-group v-model="gimbal.mode" @change="handleGimbalMode" size="small">
        <el-radio-button label="mavlink">{{ $t('air.gimbal_mode_mavlink') }}</el-radio-button>
        <el-radio-button label="neutral">{{ $t('air.gimbal_mode_neutral') }}</el-radio-button>
        <el-radio-button label="rc">{{ $t('air.gimbal_mode_rc') }}</el-radio-button>
      </el-radio-group>
    </template>
    <template>
      <div class="monitor-drone-control">
        <div class="monitor-drone-control--horizontal">
          <!-- pitch angle right -->
          <el-slider
            v-model="gimbal.yaw"
            :max="90"
            :min="-90"
            :disabled="gimbalDisabled"
            @change="handleGimbalCtl({ yaw: $event })"
            style="width:180px"
          />
          <!-- button 'center' -->
          <el-tooltip
            class="monitor-drone-control__restore"
            placement="top"
            :content="$t('air.gimbal_center')"
          >
            <el-button
              circle
              size="mini"
              icon="el-icon-refresh"
              :disabled="gimbalDisabled"
              @click="handleRestore"
            ></el-button>
          </el-tooltip>
        </div>
        <div class="monitor-drone-control--vertical">
          <!-- pitch angle left -->
          <el-slider
            vertical
            v-model="gimbal.pitch"
            :max="45"
            :min="-90"
            :disabled="gimbalDisabled"
            @change="handleGimbalCtl({ pitch: $event })"
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
      },
      gesture: {
        valid: false,
        lastPos: {
          x: 0,
          y: 0
        }
      }
    };
  },
  computed: {
    gimbalDisabled() {
      return this.status != 0 || this.gimbal.mode !== 'mavlink';
    },
  },
  methods: {
    /**
     * @param { 'mavlink' | 'netural' | 'rc' } mode
     */
    handleGimbalMode(mode) {
      this.gimbal.mode = '';
      this.$mqtt(this.point.node_id, {
        mission: 'gimbalmode',
        arg: [mode]
      }, {
        notification: true
      }).then(() => {
        this.gimbal.mode = mode;
      });
    },
    /**
     * @param {{ yaw?: number; pitch?: number }} param
     */
    handleGimbalCtl(param) {
      const { yaw, pitch } = this.gimbal;
      this.$mqtt(this.point.node_id, {
        mission: 'gimbal',
        arg: Object.assign({ yaw, pitch }, param)
      }, {
        notification: true
      });
    },
    handleRestore() {
      this.handleGimbalCtl({ yaw: 0, pitch: 0 });
      this.gimbal.yaw = 0;
      this.gimbal.pitch = 0;
    },
    handleGestureStart(x, y) {
      this.gesture.valid = true;
      this.gesture.lastPos = { x, y };
    },
    handleGestureEnd(x, y) {
      if (this.gimbalDisabled) return;
      if (this.gesture.valid) {
        this.gesture.valid = false;
        let { yaw, pitch } = this.gimbal;
        const dx = Math.floor((this.gesture.lastPos.x - x) / 10);
        const dy = Math.floor((this.gesture.lastPos.y - y) / 10);
        if (yaw + dx > 90) {
          yaw = 90;
        } else if (yaw + dx < -90) {
          yaw = -90;
        } else {
          yaw += dx;
        }
        if (pitch + dy > 45) {
          pitch = 45;
        } else if (pitch + dy < -90) {
          pitch = -90;
        } else {
          pitch += dy;
        }
        this.gimbal.yaw = yaw;
        this.gimbal.pitch = pitch;
        this.handleGimbalCtl({ yaw, pitch });
      }
    },
    bindGestures() {
      /** @type {HTMLDivElement} */
      const el = this.$el.getElementsByClassName('monitor-drone-control')[0];
      if (el) {
        el.addEventListener('mousedown', ev => {
          if (this.gimbalDisabled) return;
          ev.preventDefault();
          this.handleGestureStart(ev.x, ev.y);
        });
        el.addEventListener('touchstart', ev => {
          if (ev.target !== el && event.target.parentElement !== el) return;
          if (this.gimbalDisabled) return;
          ev.preventDefault();
          const t = ev.touches[0] || ev.targetTouches[0] || ev.changedTouches[0];
          if (!t) return;
          this.handleGestureStart(t.pageX, t.pageY);
        });
        el.addEventListener('mouseup', ev => {
          if (this.gimbalDisabled) return;
          ev.preventDefault();
          this.handleGestureEnd(ev.x, ev.y);
        });
        el.addEventListener('touchend', ev => {
          if (ev.target !== el && event.target.parentElement !== el) return;
          if (this.gimbalDisabled) return;
          ev.preventDefault();
          const t = ev.touches[0] || ev.targetTouches[0] || ev.changedTouches[0];
          if (!t) return;
          this.handleGestureEnd(t.pageX, t.pageY);
        });
      }
    }
  },
  mounted() {
    this.bindGestures();
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
  bottom: 0;
}
.monitor-drone-control--horizontal {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}
.monitor-drone-control--vertical {
  display: flex;
  justify-content: flex-end;
}
.monitor-drone-control__restore {
  margin: 0 5px;
}
.sd--safari .monitor--full .monitor-drone-control {
  top: 18px;
  right: 4px;
  overflow: hidden;
}
</style>
