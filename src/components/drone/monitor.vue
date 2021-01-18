<template>
  <sd-node-monitor :point="point" :status="status">
    <template #action>
      <el-button
        icon="el-icon-place"
        size="small"
        :type="joystick.show ? 'primary' : 'default'"
        :disabled="joystickDisabled"
        :loading="joystick.pending"
        @click="toggleJoystick"
      >
        <span v-t="'air.joystick'"></span>
      </el-button>
      <el-radio-group
        v-model="gimbal.mode"
        :disabled="gimbalModeDisabled"
        @change="handleGimbalMode"
        class="monitor-drone__switch"
        size="small"
      >
        <el-radio-button v-for="m in range.mode" :key="m" :label="m">
          <span v-t="$te(`air.gimbal.${m}`) ? `air.gimbal.${m}` : m"></span>
        </el-radio-button>
      </el-radio-group>
    </template>
    <template>
      <div class="monitor__overlay">
        <svg class="monitor__svg" :view-box.camel="overlaySVG.viewBox">
          <component
            v-for="(shape, index) of overlaySVG.elements"
            :key="index"
            :is="shape.type"
            v-bind="shape"
            v-text="shape.text"
          />
        </svg>
      </div>
      <div class="monitor-drone-control" :class="wrapperClass">
        <transition name="el-fade-in">
          <div
            v-show="overlay.show"
            class="monitor-drone-control__focus"
            :style="`left:${overlay.left}px;top:${overlay.top}px`"
          ></div>
        </transition>
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
      <div class="monitor-drone-joystick" ref="joysticks" v-show="joystick.show">
        <div class="monitor-drone-joystick__zone"></div>
        <div class="monitor-drone-joystick__zone"></div>
      </div>
    </template>
  </sd-node-monitor>
</template>

<script>
import throttle from 'lodash/throttle';
import nipplejs from 'nipplejs';

import { h } from '@/util/create-element';
import { waitSelector } from '@/util/wait-selector';

import Monitor from '@/components/monitor/monitor.vue';

export default {
  name: 'sd-drone-mointor',
  inheritAttrs: false,
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
      },
      overlay: {
        show: false,
        left: 0,
        top: 0
      },
      joystick: {
        show: false,
        pending: false,
        created: false,
        moving: [false, false],
        data: [{ x: 0, y: 0 }, { x: 0, y: 0 }],
        interval: -1
      }
    };
  },
  computed: {
    joystickDisabled() {
      return this.status.code !== 0 || this.joystick.pending;
    },
    gimbalModeDisabled() {
      return this.status.code !== 0;
    },
    overlaySVG() {
      const { width, height, shapes } = this.msg.overlay_screen;
      const elements = [];
      for (const s of shapes) {
        elements.push(s);
        if (s.label) {
          const offset = s['stroke-width'] || 1;
          elements.push({
            type: 'text',
            text: s.label,
            x: s.x + offset,
            y: s.y + offset,
            'alignment-baseline': 'hanging',
            fill: s.stroke || s.fill
          });
        }
      }
      return { viewBox: `0 0 ${width} ${height}`, elements };
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
    handleGimbalTarget(x, y) {
      this.$mqtt(this.point.node_id, {
        mission: 'gimbal_target',
        arg: { x: Math.trunc(x * 1000) / 1000, y: Math.trunc(y * 1000) / 1000 }
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
    /**
     * @param {DOMRect} rect
     * @param {MouseEvent} ev
     */
    handleDblClick(rect, ev) {
      const left = ev.clientX - rect.left;
      const top = ev.clientY - rect.top;
      const x = left / rect.width;
      const y = top / rect.height;
      this.handleGimbalTarget(x, y);
      this.overlay = { left, top, show: true };
      setTimeout(() => {
        if (top === this.overlay.top && left === this.overlay.left) {
          this.overlay.show = false;
        }
      }, 500);
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
      // Double Click
      el.addEventListener('dblclick', ev => {
        if (!['mavlink', 'manual'].includes(this.gimbal.mode)) return;
        const rect = el.getBoundingClientRect();
        this.handleDblClick(rect, ev);
      });
    },
    /**
     * @param {number} index
     */
    createSingleJoystick(index) {
      const instance = nipplejs.create({
        zone: this.$refs.joysticks.children[index],
        mode: 'static',
        position: { top: '50%', left: '50%' },
        dynamicPage: true,
        restOpacity: 0.6,
        fadeTime: 200
      });
      instance.on('start', () => this.$set(this.joystick.moving, index, true));
      instance.on('end', () => {
        this.$set(this.joystick.moving, index, false);
        this.$set(this.joystick.data, index, { x: 0, y: 0 });
      });
      instance.on('move', (e, data) => this.$set(this.joystick.data, index, data.vector));
      return instance;
    },
    createJoystick() {
      const joysticks = [];
      for (let i = 0; i < 2; i++) {
        joysticks.push(this.createSingleJoystick(i));
      }
      waitSelector(this.$refs.joysticks.children[0], '.back').then(el => {
        el.append(
          h('i', { class: 'el-icon-top', style: 'top:0;left:42px' }),
          h('i', { class: 'el-icon-refresh-right', style: 'top:42px;right:0' }),
          h('i', { class: 'el-icon-bottom', style: 'bottom:0;left:42px' }),
          h('i', { class: 'el-icon-refresh-left', style: 'top:42px;left:0' })
        );
      });
      waitSelector(this.$refs.joysticks.children[1], '.back').then(el => {
        el.append(
          h('i', { class: 'el-icon-arrow-up', style: 'top:0;left:42px' }),
          h('i', { class: 'el-icon-arrow-right', style: 'top:42px;right:0' }),
          h('i', { class: 'el-icon-arrow-down', style: 'bottom:0;left:42px' }),
          h('i', { class: 'el-icon-arrow-left', style: 'top:42px;left:0' })
        );
      });
      this._joysticks = joysticks;
      this.joystick.created = true;
    },
    async toggleJoystick() {
      const initialShow = this.joystick.show;
      try {
        this.joystick.pending = true;
        await this.$mqtt(this.point.node_id, {
          mission: 'stick_mode',
          arg: [initialShow ? 'rc' : 'virtual']
        });
        this.joystick.show = !initialShow;
        if (this.joystick.show && !this.joystick.created) {
          this.createJoystick();
        }
        this.$refs.joysticks.style.display = this.joystick.show ? '' : 'none';
      } catch (e) { /* noop */ }
      this.joystick.pending = false;
    },
    destroyJoystick() {
      if (Array.isArray(this._joysticks)) {
        for (const instance of this._joysticks) {
          instance.destroy();
        }
        delete this._joysticks;
      }
      this.joystick.created = false;
    },
    sendStickCtl() {
      const [m0, m1] = this.joystick.data;
      const r = num => Math.floor(num * 100);
      this.$mqtt(this.point.node_id, {
        mission: 'stick_ctl',
        arg: {
          x: r(m1.x),
          y: r(m1.y),
          z: r(m0.y),
          r: r(m0.x)
        }
      }, { notification: true });
    }
  },
  watch: {
    ['status.code'](val) {
      if (val !== 0) {
        if (this.joystick.created) {
          this.destroyJoystick();
        }
      } else {
        if (this.joystick.show) {
          this.$nextTick(() => this.createJoystick());
        }
      }
    },
    ['joystick.moving'](val) {
      if (val.every(v => v === false)) {
        if (this.joystick.interval >= 0) {
          clearInterval(this.joystick.interval);
          this.joystick.interval = -1;
        }
      } else {
        if (this.joystick.interval < 0) {
          this.joystick.interval = setInterval(() => {
            this.sendStickCtl();
          }, 1000 / 25);
        }
      }
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
  beforeDestroy() {
    this.destroyJoystick();
  },
  components: {
    [Monitor.name]: Monitor
  }
};
</script>

<style>
.monitor-drone__switch {
  margin-left: 10px;
}
.monitor-drone-control,
.monitor__overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
}
.monitor__svg {
  width: 100%;
  height: 100%;
  fill: none;
  stroke: none;
  font-size: 24px;
}
.monitor-drone-control__focus {
  position: absolute;
  width: 40px;
  height: 40px;
  border-radius: 20px;
  margin: -20px 0 0 -20px;
  background-color: #409effb2;
  transition-property: opacity;
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
.monitor-drone-joystick {
  position: absolute;
  bottom: 10px;
  right: 0;
  left: 0;
  height: 120px;
  display: flex;
  justify-content: center;
}
.monitor-drone-joystick__zone {
  position: relative;
  height: 120px;
  width: 120px;
  margin: 0 10px;
}
.monitor-drone-joystick__zone i {
  position: absolute;
}
.monitor-drone-joystick__zone .front {
  width: 30px !important;
  height: 30px !important;
  margin: -15px 0 0 -15px !important;
}
.sd--safari .monitor--full .monitor-drone-control {
  top: 18px;
  right: 4px;
  overflow: hidden;
}
</style>
