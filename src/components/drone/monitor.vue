<template>
  <sd-node-monitor :point="point" :status="status">
    <template #action>
      <el-radio-group
        v-model="gimbal.mode"
        :disabled="gimbalModeDisabled"
        @change="handleGimbalMode"
        size="small"
      >
        <el-radio-button v-for="m in range.mode" :key="m" :label="m">
          <span v-t="$te(`air.gimbal.${m}`) ? `air.gimbal.${m}` : m"></span>
        </el-radio-button>
      </el-radio-group>
    </template>
    <template>
      <div class="monitor-drone-control" :class="wrapperClass">
        <div class="monitor-drone-control--horizontal">
          <!-- pitch angle right -->
          <el-slider
            v-model="gimbal.yaw"
            :min="range.yaw[0]"
            :max="range.yaw[1]"
            :disabled="gimbalDisabled"
            @change="handleGimbalCtl({ yaw: $event })"
            style="width:180px"
          />
          <!-- button 'center' -->
          <el-tooltip class="monitor-drone-control__restore" placement="top">
            <span slot="content" v-t="'air.gimbal.center'"></span>
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
            :min="range.pitch[0]"
            :max="range.pitch[1]"
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
import throttle from 'lodash/throttle';

import Monitor from '@/components/monitor/monitor.vue';

export default {
  name: 'sd-drone-mointor',
  props: {
    point: {
      type: Object,
      required: true
    },
    status: {
      type: Object,
      required: true
    },
    msg: {
      type: Object,
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
      range: {
        mode: ['mavlink', 'neutral', 'rc'],
        yaw: [-90, 90],
        pitch: [-90, 45]
      },
      gesture: {
        valid: false,
        lastTime: -1,
        lastPos: {
          x: 0,
          y: 0
        }
      }
    };
  },
  computed: {
    gimbalModeDisabled() {
      return this.status.code !== 0;
    },
    gimbalDisabled() {
      return this.status.code !== 0 || this.gimbal.mode !== 'mavlink';
    },
    wrapperClass() {
      return {
        'monitor-drone-control--moving': this.gesture.valid
      };
    }
  },
  methods: {
    /**
     * @param {string} mode
     */
    handleGimbalMode(mode) {
      this.gimbal.mode = '';
      this.$mqtt(this.point.node_id, {
        mission: 'gimbal_mode',
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
        mission: 'gimbal_ctl',
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
      if (this.gimbalDisabled) return;
      this.gesture.valid = true;
      this.gesture.lastPos = { x, y };
      this.gesture.lastTime = Date.now();
    },
    handleGestureMove(x, y) {
      if (this.gimbalDisabled) return;
      if (!this.gesture.valid) return;
      this.sendGestureCtl(x, y);
      this.gesture.lastPos = { x, y };
    },
    handleGestureEnd(x, y) {
      if (this.gimbalDisabled) return;
      if (!this.gesture.valid) return;
      this.sendGestureCtl(x, y);
      this.gesture.valid = false;
    },
    sendGestureCtl(x, y) {
      const now = Date.now();
      const factor = (now - this.gesture.lastTime) / 8;
      let { yaw, pitch } = this.gimbal;
      const dx = Math.trunc((this.gesture.lastPos.x - x) / factor);
      const dy = Math.trunc((y - this.gesture.lastPos.y) / factor);
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
      this.gesture.lastTime = now;
    },
    bindGestures() {
      /** @type {HTMLDivElement} */
      const el = this.$el.getElementsByClassName('monitor-drone-control')[0];
      if (!el) {
        setTimeout(() => this.bindGestures(), 150);
        return;
      }
      // Gesture Start
      el.addEventListener('mousedown', ev => {
        if (ev.target !== el && event.target.parentElement !== el) return;
        this.handleGestureStart(ev.x, ev.y);
      });
      el.addEventListener('touchstart', ev => {
        if (ev.target !== el && event.target.parentElement !== el) return;
        // do not prevent scroll when control disabled
        if (this.gimbalDisabled) return;
        ev.preventDefault();
        const t = ev.touches[0] || ev.targetTouches[0] || ev.changedTouches[0];
        if (!t) return;
        this.handleGestureStart(t.pageX, t.pageY);
      });
      // Gesture Move
      el.addEventListener('mousemove', ev => {
        this.handleGestureMoveThrottled(ev.x, ev.y);
      });
      el.addEventListener('touchmove', ev => {
        if (ev.target !== el && event.target.parentElement !== el) return;
        const t = ev.touches[0] || ev.targetTouches[0] || ev.changedTouches[0];
        if (!t) return;
        this.handleGestureMoveThrottled(t.pageX, t.pageY);
      });
      // Gesture End
      el.addEventListener('mouseup', ev => {
        this.handleGestureEnd(ev.x, ev.y);
      });
      el.addEventListener('touchend', ev => {
        if (ev.target !== el && event.target.parentElement !== el) return;
        const t = ev.touches[0] || ev.targetTouches[0] || ev.changedTouches[0];
        if (!t) return;
        this.handleGestureEnd(t.pageX, t.pageY);
      });
      // Gesture Cancel
      el.addEventListener('mouseleave', ev => {
        this.handleGestureEnd(ev.x, ev.y);
      });
    }
  },
  created() {
    this.gimbal = { ...this.msg.gimbal };
    if (this.point.params) {
      this.range = this.point.params;
    }
  },
  mounted() {
    this.handleGestureMoveThrottled = throttle(this.handleGestureMove, 55);
    this.$nextTick(() => this.bindGestures());
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
.monitor-drone-control--moving {
  cursor: move;
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
