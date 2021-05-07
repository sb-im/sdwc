<template>
  <sd-node-monitor ref="monitor" :point="point" :status="status">
    <template #action>
      <!-- video source dropdown -->
      <el-dropdown trigger="click">
        <el-button size="small" :disabled="allDisabled || source.pending">
          <span v-t="'monitor.source.title'"></span>
          <i :class="`el-icon--right el-icon-${source.pending ? 'loading' : 'arrow-down'}`"></i>
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item v-if="videoSources.length === 0" disabled>
            <span v-t="'monitor.source.empty'"></span>
          </el-dropdown-item>
          <template v-else>
            <el-dropdown-item
              v-for="s of videoSources"
              :key="s.source"
              @click.native="handleVideoSource(s.source, $event)"
            >
              <el-radio :value="msg.gimbal.source" :label="s.source">
                <span v-t="s.label || s.source"></span>
              </el-radio>
            </el-dropdown-item>
            <el-dropdown-item divided @click.native="handleRestratStream">
              <i class="el-icon-video-play"></i>
              <span v-t="'monitor.source.reload'"></span>
            </el-dropdown-item>
            <el-dropdown-item @click.native="handleReconnect">
              <i class="el-icon-refresh-right"></i>
              <span v-t="'monitor.source.reconnect'"></span>
            </el-dropdown-item>
          </template>
        </el-dropdown-menu>
      </el-dropdown>
      <!-- control dropdown -->
      <el-dropdown trigger="click">
        <el-button size="small" :disabled="allDisabled">
          <span v-t="'monitor.control.title'"></span>
          <i class="el-icon-arrow-down el-icon--right"></i>
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item v-if="availableControls.length === 0 && !hasStickControl" disabled>
            <span v-t="'monitor.control.empty'"></span>
          </el-dropdown-item>
          <el-dropdown-item
            v-for="c of availableControls"
            :key="c.type"
            @click.native="handleControlType(c.type, $event)"
          >
            <el-radio :value="control.enabled" :label="c.type">
              <span v-t="c.label || c.method"></span>
            </el-radio>
          </el-dropdown-item>
          <!-- dedicated dropdown-item for virtual joystick control -->
          <el-dropdown-item
            v-if="hasStickControl"
            :disabled="joystick.pending"
            divided
            @click.native="handleControlType('stick', $event)"
          >
            <el-checkbox :value="joystick.show" :disabled="joystick.pending">
              <span v-t="point.params.control.stick.label || point.params.control.stick.method"></span>
            </el-checkbox>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <!-- action dropdown -->
      <el-dropdown trigger="click" @command="handleAction">
        <el-button size="small" :disabled="allDisabled">
          <span v-t="'monitor.action.title'"></span>
          <i class="el-icon-arrow-down el-icon--right"></i>
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item v-if="availableActions.length === 0" disabled>
            <span v-t="'monitor.action.empty'"></span>
          </el-dropdown-item>
          <el-dropdown-item v-for="a of availableActions" :key="a.method" :command="a.method">
            <span v-t="a.label || a.method"></span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
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
      <!-- on-screen control container, also host click events -->
      <div class="monitor-drone-control" :class="wrapperClass">
        <!-- double-click target point -->
        <transition name="el-fade-in">
          <div
            v-show="target.show"
            class="monitor-drone-control__target"
            :style="`left:${target.left}px;top:${target.top}px`"
          ></div>
        </transition>
        <div
          v-if="point.params && point.params.control && point.params.control.gimbal"
          v-show="control.enabled === 'gimbal'"
          class="monitor-drone-control--horizontal"
        >
          <!-- pitch angle right -->
          <el-slider
            v-model="gimbal.yaw"
            :min="point.params.control.gimbal.yaw[0]"
            :max="point.params.control.gimbal.yaw[1]"
            @change="handleGimbalCtl({ yaw: $event })"
            style="width:180px"
          />
          <!-- button 'center' -->
          <el-tooltip class="monitor-drone-control__restore" placement="top">
            <span slot="content" v-t="'monitor.gimbal.reset'"></span>
            <el-button circle size="mini" icon="el-icon-refresh" @click="handleGimbalRestore"></el-button>
          </el-tooltip>
        </div>
        <div
          v-if="point.params && point.params.control && point.params.control.gimbal"
          v-show="control.enabled === 'gimbal'"
          class="monitor-drone-control--vertical"
        >
          <!-- pitch angle left -->
          <el-slider
            vertical
            v-model="gimbal.pitch"
            :min="point.params.control.gimbal.pitch[0]"
            :max="point.params.control.gimbal.pitch[1]"
            @change="handleGimbalCtl({ pitch: $event })"
            height="135px"
          />
        </div>
        <div
          v-if="point.params && point.params.control && point.params.control.zoom"
          v-show="control.enabled === 'zoom'"
          class="monitor-drone-control--bottom"
        >
          <!-- zoom slider bottom -->
          <el-slider
            vertical
            v-model="gimbal.zoom"
            :min="point.params.control.zoom.zoom[0]"
            :max="point.params.control.zoom.zoom[1]"
            :step="0.1"
            @change="handleGimbalZoom"
            height="100px"
          />
          <!-- zoom reset -->
          <el-tooltip class="monitor-drone-control__restore" placement="bottom">
            <span slot="content" v-t="'monitor.zoom.reset'"></span>
            <el-button circle size="mini" icon="el-icon-refresh" @click="handleZoomRestore"></el-button>
          </el-tooltip>
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
      source: {
        pending: false
      },
      control: {
        enabled: ''
      },
      gimbal: {
        yaw: 0,
        pitch: 0,
        zoom: 1,
        source: ''
      },
      gesture: {
        valid: false,
        lastTime: -1,
        lastPos: {
          x: 0,
          y: 0
        }
      },
      target: {
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
    allDisabled() {
      return this.status.code !== 0;
    },
    videoSources() {
      const params = this.point.params || { source: [] };
      return params.source;
    },
    availableControls() {
      const params = this.point.params || { control: {} };
      const controls = [];
      for (const [k, v] of Object.entries(params.control)) {
        if (k === 'stick') continue;
        controls.push(Object.assign({ type: k }, v));
      }
      return controls;
    },
    hasStickControl() {
      const params = this.point.params || { control: {} };
      return Object.prototype.hasOwnProperty.call(params.control, 'stick');
    },
    availableActions() {
      const params = this.point.params || { action: [] };
      const enabled = this.msg.action_enabled;
      return params.action.filter(a => enabled.includes(a.method));
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
      return this.allDisabled || this.control.enabled !== 'gimbal';
    },
    wrapperClass() {
      return {
        'monitor-drone-control--moving': this.gesture.valid
      };
    }
  },
  methods: {
    /**
     * @param {'visual' | 'thermal' | 'msx'} source
     * @param {MouseEvent} event
     */
    async handleVideoSource(source, event) {
      /**
       * in dom like `<label><input type="radio"><span>text<span></label>`,
       * click on span causes label's click event triggers twice.
       * 1st's target is span, 2nd's target is input.
       */
      if (event.target.tagName === 'INPUT') return;
      this.source.pending = true;
      try {
        await this.$mqtt(this.point.node_id, {
          mission: 'camera',
          arg: { action: 'source', value: source }
        });
      } catch (e) { /* noop */ }
      this.source.pending = false;
    },
    async handleRestratStream() {
      this.source.pending = true;
      try {
        await this.$mqtt(this.point.node_id, {
          mission: 'restart_stream'
        });
      } catch (e) { /* noop */ }
      this.source.pending = false;
    },
    handleReconnect() {
      this.$refs.monitor.$refs.content.handleRetry();
    },
    /**
     * @param {'gimbal' | 'zoom' | 'stick'} type
     * @param {MouseEvent} event
     */
    handleControlType(type, event) {
      if (event.target.tagName === 'INPUT') return;
      if (type === 'stick') {
        this.toggleJoystick();
      } else if (this.control.enabled === type) {
        this.control.enabled = '';
      } else {
        this.control.enabled = type;
      }
    },
    /**
     * @param {string} method
     */
    handleAction(method) {
      this.$mqtt(this.point.node_id, {
        mission: method
      });
    },
    /**
     * @param {{ yaw?: number; pitch?: number }} param
     */
    handleGimbalCtl(param) {
      this.$mqtt(this.point.node_id, {
        mission: 'gimbal',
        arg: param
      }, {
        notification: true
      });
    },
    /**
     * @param {number} zoom
     */
    handleGimbalZoom(zoom) {
      this.$mqtt(this.point.node_id, {
        mission: 'camera',
        arg: { action: 'zoom', zoom }
      }, {
        notification: true
      });
    },
    handleGimbalTarget(x, y) {
      const t = x => Math.trunc(x * 1000) / 1000;
      this.$mqtt(this.point.node_id, {
        mission: 'gimbal_target',
        arg: { x: t(x), y: t(y) }
      }, {
        notification: true
      });
    },
    handleGimbalRestore() {
      this.handleGimbalCtl({ yaw: 0, pitch: 0 });
      this.gimbal.yaw = 0;
      this.gimbal.pitch = 0;
    },
    handleZoomRestore() {
      this.handleGimbalZoom(1);
      this.gimbal.zoom = 0;
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
      if (this.gesture.lastPos.x !== x || this.gesture.lastPos.y !== y) {
        this.sendGestureCtl(x, y);
      }
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
      this.target = { left, top, show: true };
      setTimeout(() => {
        if (top === this.target.top && left === this.target.left) {
          this.target.show = false;
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
      const r = num => Math.round(num * 100);
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
    // TODO: sync values between msg.gimbal and $data.gimbal
    this.gimbal = { ...this.msg.gimbal };
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
.drone .sd-card__action .el-dropdown {
  margin-left: 10px;
}
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
.monitor-drone-control__target {
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
.monitor-drone-control--bottom {
  position: absolute;
  bottom: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}
.monitor-drone-control--moving {
  cursor: move;
}
.monitor-drone-control__restore {
  margin: 5px;
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
