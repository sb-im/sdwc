<template>
  <sd-node-monitor ref="monitor" :point="point" :status="status" v-bind="$attrs">
    <template #action>
      <!-- video source dropdown -->
      <el-dropdown v-if="videoSources.length > 0"  trigger="click">
        <el-button size="small" :disabled="allDisabled || source.pending">
          <span v-t="'monitor.source.title'"></span>
          <i :class="`el-icon--right el-icon-${source.pending ? 'loading' : 'arrow-down'}`"></i>
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <template>
            <el-dropdown-item
              v-for="s of videoSources"
              :key="s.source"
              @click.native="handleVideoSource(s.source, $event)"
            >
              <el-radio :value="msg.gimbal.source" :label="s.source">
                <span v-t="s.label || `monitor.source.${s.source}` || s.source"></span>
              </el-radio>
            </el-dropdown-item>
            <el-dropdown-item divided @click.native="handleRestratStream">
              <i class="el-icon-video-play"></i>
              <span v-t="'monitor.source.reload'"></span>
            </el-dropdown-item>
          </template>
        </el-dropdown-menu>
      </el-dropdown>
      <!-- control dropdown -->
      <el-dropdown v-if="availableControls.length > 0  || hasStickControl" trigger="click">
        <el-button size="small" :disabled="allDisabled">
          <span v-t="'monitor.control.title'"></span>
          <i class="el-icon-arrow-down el-icon--right"></i>
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item
            v-for="c of availableControls"
            :key="c.type"
            @click.native="handleControlType(c.type, $event)"
          >
            <el-checkbox :value="control.enabled[c.type]" :label="c.type">
              <span v-t="c.label || `monitor.control.${c.type}`  || c.method"></span>
            </el-checkbox>
          </el-dropdown-item>
          <!-- dedicated dropdown-item for virtual joystick control -->
          <el-dropdown-item
            v-if="hasStickControl"
            :disabled="joystick.pending"
            divided
            @click.native="handleControlType('stick', $event)"
          >
            <el-checkbox :value="joystick.show" :disabled="joystick.pending">
              <span v-t="'monitor.control.stick'"></span>
            </el-checkbox>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <!-- action dropdown -->
      <el-dropdown v-if="availableActions.length > 0" trigger="click" @command="handleAction">
        <el-button size="small" :disabled="allDisabled">
          <span v-t="'monitor.action.title'"></span>
          <i class="el-icon-arrow-down el-icon--right"></i>
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item v-if="shownActions.length === 0" disabled>
            <span v-t="'monitor.action.empty'"></span>
          </el-dropdown-item>
          <el-dropdown-item v-for="a of shownActions" :key="a.method" :command="a.method">
            <span v-t="a.label || `monitor.action.${a.method}` || a.method"></span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </template>
    <template>
      <div class="monitor__overlay">
        <svg class="monitor__svg" :view-box.camel="overlaySVG.viewBox">
          <!-- eslint-disable vue/no-v-text-v-html-on-component -->
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
            :class="target.type"
            :style="`left:${target.left}px;top:${target.top}px`"
          ></div>
        </transition>
        <!-- gimbal slider and reset button -->
        <div v-if="hasGimbalControl" v-show="control.enabled.gimbal">
          <div class="monitor-drone-control--vertical">
            <!-- button 'center' -->
            <el-tooltip class="monitor-drone-control__restore" placement="top">
              <span slot="content" v-t="'monitor.gimbal.reset'"></span>
              <el-button circle size="mini" icon="el-icon-refresh" @click="handleGimbalRestore"></el-button>
            </el-tooltip>
            <!-- pitch angle left -->
            <el-slider
              vertical
              v-model="gimbal.pitch"
              :min="point.params.control.gimbal.pitch[0]"
              :max="point.params.control.gimbal.pitch[1]"
              :marks="{ [msg.gimbal.pitch]: `${msg.gimbal.pitch}` }"
              @change="handleGimbalCtl({ pitch: $event })"
              height="135px"
            />
          </div>
          <div class="monitor-drone-control--horizontal">
            <!-- pitch angle right -->
            <el-slider
              v-model="gimbal.yaw"
              :min="point.params.control.gimbal.yaw[0]"
              :max="point.params.control.gimbal.yaw[1]"
              :marks="{ [msg.gimbal.yaw]: `${msg.gimbal.yaw}` }"
              @change="handleGimbalCtl({ yaw: $event })"
              style="width:180px"
            />
          </div>
        </div>
        <!-- zoom slider and reset button -->
        <div
          v-if="hasZoomControl"
          v-show="control.enabled.zoom"
          class="monitor-drone-control--bottom"
        >
          <!-- zoom slider bottom -->
          <el-slider
            vertical
            v-model="gimbal.zoom"
            :min="point.params.control.zoom.zoom[0]"
            :max="point.params.control.zoom.zoom[1]"
            :step="0.1"
            :marks="{ [msg.gimbal.zoom]: `${msg.gimbal.zoom}` }"
            @change="handleGimbalZoom"
            height="135px"
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
import get from 'lodash/get';
import has from 'lodash/has';
import throttle from 'lodash/throttle';
import nipplejs from 'nipplejs';

import { h } from '@/util/create-element';
import { waitSelector } from '@/util/wait-selector';

import Monitor from '@/components/monitor/monitor.vue';

const trunc = (decimal, digit = 4) => {
  const p = Math.pow(10, digit);
  return Math.trunc(decimal * p) / p;
};

export default {
  name: 'sd-drone-mointor',
  inheritAttrs: false,
  props: {
    /** @type {Vue.PropOptions<SDWC.NodePoint>} */
    point: {
      type: Object,
      required: true
    },
    /** @type {Vue.PropOptions<SDWC.NodeConnectionStatus>} */
    status: {
      type: Object,
      required: true
    },
    /** @type {Vue.PropOptions<SDWC.NodeMsg>} */
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
        enabled: {
          click: false,
          target: false,
          gimbal: false,
          zoom: false
        }
      },
      gimbal: {
        yaw: 0,
        pitch: 0,
        zoom: 1,
        source: ''
      },
      gesture: {
        pressed: false,
        moving: false,
        lastTime: -1,
        lastPos: {
          x: 0,
          y: 0
        }
      },
      click: {
        timeoutId: -1,
        prevent: false
      },
      target: {
        type: '',
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
    /** @returns {boolean} */
    allDisabled() {
      return this.status.code !== 0;
    },
    /** @returns {{ source: string, label: string }[]} */
    videoSources() {
      return get(this.point.params, 'source', []);
    },
    /**
     * `height / width`, typically `9 / 16 == 0.5265`
     * @returns {number}
     */
    videoAspectRatio() {
      const { width = 1280, height = 720 } = get(this.point.params, 'resolution', {});
      return height / width;
    },
    /** @returns {{ type: string, method: string, label: string }[]} */
    availableControls() {
      const controls = [];
      for (const [k, v] of Object.entries(get(this.point.params, 'control', {}))) {
        if (k === 'stick') continue;
        controls.push(Object.assign({ type: k }, v));
      }
      return controls;
    },
    /** @returns {boolean} */
    hasClickControl() {
      // single click `pin_screen`
      return has(this.point.params, 'control.click');
    },
    /** @returns {boolean} */
    hasTargetControl() {
      // double click `gimbal_target`
      return has(this.point.params, 'control.target');
    },
    /** @returns {boolean} */
    hasGimbalControl() {
      return has(this.point.params, 'control.gimbal');
    },
    /** @returns {boolean} */
    hasZoomControl() {
      return has(this.point.params, 'control.zoom');
    },
    /** @returns {boolean} */
    hasStickControl() {
      return has(this.point.params, 'control.stick');
    },
    /** @returns {{ method: string, label: string }[]} */
    availableActions() {
      return get(this.point.params, 'action', []);
    },
    /** @returns {{ method: string, label: string }[]} */
    shownActions() {
      const enabled = this.msg.action_enabled;
      return this.availableActions.filter(a => enabled.includes(a.method));
    },
    /** @returns {{ viewBox: string, elements: { type: string, text: string }[] }} */
    overlaySVG() {
      const { width = 1280, height = 720, shapes = [] } = this.msg.overlay_screen;
      const elements = [];
      for (const s of shapes) {
        elements.push(s);
        if (s.label) {
          // offset so it won't overlap with element's fill and stroke
          const offset = (s['stroke-width'] || 2) / 2 + (s.r || 0);
          const metrics = this.measureLabel(s);
          const elm = {
            type: 'text',
            text: s.label,
            // when `s.x` is `0`, don't fallback to `s.cx` which likely to be `undefined`
            x: s.x ?? s.cx,
            y: s.y ?? s.cy,
            fill: s.fill || s.stroke
          };
          if (elm.x + metrics.width + offset > width) {
            // extra 2px offset on X axis, so the left or right edge of the text
            // won't touch element's stroke edge
            elm.x -= (offset + 2);
            elm['text-anchor'] = 'end';
          } else {
            elm.x += (offset + 2);
            elm['text-anchor'] = 'start';
          }
          if (elm.y + metrics.height + offset > height) {
            elm.y -= offset;
            elm['dominant-baseline'] = 'text-top';
          } else {
            elm.y += offset;
            elm['dominant-baseline'] = 'hanging';
          }
          elements.push(elm);
        }
      }
      return { viewBox: `0 0 ${width} ${height}`, elements };
    },
    /** @returns {boolean} */
    gimbalDisabled() {
      return this.allDisabled || !this.control.enabled.gimbal;
    },
    /** @returns {{ [key: string]: boolean }} */
    wrapperClass() {
      return {
        'monitor-drone-control--moving': this.gesture.moving
      };
    }
  },
  methods: {
    /**
     * @param {string} source
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
    /**
     * @param {string} type
     * @param {MouseEvent} event
     */
    handleControlType(type, event) {
      if (event.target.tagName === 'INPUT') return;
      this.$set(this.control.enabled, type, !this.control.enabled[type]);
      if (type === 'stick') {
        this.toggleJoystick();
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
     * @param {number} value
     */
    handleGimbalZoom(value) {
      this.$mqtt(this.point.node_id, {
        mission: 'camera',
        arg: { action: 'zoom', value }
      }, {
        notification: true
      });
    },
    handlePinScreen(x, y) {
      this.$mqtt(this.point.node_id, {
        mission: 'pin_screen',
        arg: { x: trunc(x), y: trunc(y) }
      });
    },
    handleGimbalTarget(x, y) {
      this.$mqtt(this.point.node_id, {
        mission: 'gimbal_target',
        arg: { x: trunc(x), y: trunc(y) }
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
      this.gesture.pressed = true;
      this.gesture.lastPos = { x, y };
      this.gesture.lastTime = Date.now();
    },
    handleGestureMove(x, y) {
      if (this.gimbalDisabled) return;
      if (!this.gesture.pressed) return;
      if (!this.gesture.moving) {
        this.gesture.moving = true;
      } else {
        this.sendGestureCtl(x, y);
      }
      this.gesture.lastPos = { x, y };
    },
    handleGestureEnd(x, y) {
      if (this.gimbalDisabled) return;
      if (!this.gesture.pressed) return;
      this.gesture.pressed = false;
      if (this.gesture.moving) {
        this.gesture.moving = false;
        // after a click-drag-release gesture, the final 'mouseup' would trigger
        // a 'click' event, but it's not a valid 'click' by user, so we should
        // ignore it.
        this.click.prevent = true;
      }
      if (this.gesture.lastPos.x !== x || this.gesture.lastPos.y !== y) {
        this.sendGestureCtl(x, y);
      }
    },
    sendGestureCtl(x, y) {
      const now = Date.now();
      if (this.gesture.lastTime >= now) {
        // 'mousedown' happens too late, at same time or even after 'mousemove',
        // thus this move event should be ignored.
        return;
      }
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
     * @param {Element} el
     * @param {MouseEvent} ev
     * @returns {{ left: number, top: number, x: number, y: number }}
     */
    getClickPosition(el, ev) {
      const rect = el.getBoundingClientRect();
      const rectRatio = rect.height / rect.width;
      const left = ev.clientX - rect.left;
      const top = ev.clientY - rect.top;
      let x = left / rect.width;
      let y = top / rect.height;
      if (rectRatio > this.videoAspectRatio) {
        // too tall
        const normalizedHeight = rect.width * this.videoAspectRatio;
        y = (top - (rect.height - normalizedHeight) / 2) / normalizedHeight;
      } else {
        // too wide
        const normalizedWidth = rect.height / this.videoAspectRatio;
        x = (left - (rect.width - normalizedWidth) / 2) / normalizedWidth;
      }
      return { left, top, x, y };
    },
    /**
     * @param {Element} el
     * @param {MouseEvent} ev
     */
    handleSingleClick(el, ev) {
      const { left, top, x, y } = this.getClickPosition(el, ev);
      this.handlePinScreen(x, y);
      this.target = { left, top, show: true, type: 'single' };
      setTimeout(() => {
        if (top === this.target.top && left === this.target.left) {
          this.target.show = false;
        }
      }, 500);
    },
    /**
     * @param {Element} el
     * @param {MouseEvent} ev
     */
    handleDblClick(el, ev) {
      const { left, top, x, y } = this.getClickPosition(el, ev);
      this.handleGimbalTarget(x, y);
      this.target = { left, top, show: true, type: 'double' };
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
        if (ev.target !== el) return;
        this.handleGestureStart(ev.x, ev.y);
      });
      el.addEventListener('touchstart', ev => {
        if (ev.target !== el) return;
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
        if (ev.target !== el) return;
        const t = ev.touches[0] || ev.targetTouches[0] || ev.changedTouches[0];
        if (!t) return;
        this.handleGestureMoveThrottled(t.pageX, t.pageY);
      });
      // Gesture End
      el.addEventListener('mouseup', ev => {
        this.handleGestureEnd(ev.x, ev.y);
      });
      el.addEventListener('touchend', ev => {
        if (ev.target !== el) return;
        const t = ev.touches[0] || ev.targetTouches[0] || ev.changedTouches[0];
        if (!t) return;
        this.handleGestureEnd(t.pageX, t.pageY);
      });
      // Gesture Cancel
      el.addEventListener('mouseleave', ev => {
        this.handleGestureEnd(ev.x, ev.y);
      });
      /** @type {(ev: MouseEvent) => boolean} */
      const shouldPreventClick = ev => {
        if (ev.target !== el) return true;
        // ignore 'click' evnet caused by click-drag-release gesture.
        // see `handleGestureEnd` for more details.
        if (this.click.prevent) {
          this.click.prevent = false;
          return true;
        }
        return false;
      };
      // Single and Double Click
      if (this.hasClickControl && this.hasTargetControl) {
        el.addEventListener('click', ev => {
          if (shouldPreventClick(ev)) return;
          if (this.click.timeoutId > 0) {
            clearTimeout(this.click.timeoutId);
            this.click.timeoutId = -1;
            if (this.control.enabled.target) {
              this.handleDblClick(el, ev);
            }
            return;
          }
          this.click.timeoutId = setTimeout(() => {
            this.click.timeoutId = -1;
            if (this.control.enabled.click) {
              this.handleSingleClick(el, ev);
            }
          }, 300);
        });
      } else if (this.hasClickControl) {
        // Single Click
        el.addEventListener('click', ev => {
          if (!this.control.enabled.click) return;
          if (shouldPreventClick(ev)) return;
          this.handleSingleClick(el, ev);
        });
      } else if (this.hasTargetControl) {
        // Double Click
        el.addEventListener('dblclick', ev => {
          if (!this.control.enabled.target) return;
          if (ev.target !== el) return;
          this.handleDblClick(el, ev);
        });
      }
      // Mouse wheel
      if (this.hasZoomControl) {
        el.addEventListener('wheel', ev => {
          if (!this.control.enabled.zoom) return;
          ev.preventDefault();
          let value = (this.gimbal.zoom * 10 - Math.sign(ev.deltaY)) / 10;
          const [min, max] = get(this, 'point.params.control.zoom.zoom', [1, 5.5]);
          if (value > max) {
            value = max;
          } else if (value < min) {
            value = min;
          }
          if (Math.abs(value - this.gimbal.zoom) < 1e-2) {
            return;
          }
          this.gimbal.zoom = value;
          this.handleGimbalZoom(value);
        });
      }
    },
    /**
     * @param {SDWC.NodeOverlayScreenShape} shape
     * @returns {{ width: number, height: number }}
     */
    measureLabel(shape) {
      /** @type {TextMetrics} */
      const metrics = this._ctx2d.measureText(shape.label);
      return {
        width: metrics.width,
        height: metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent
      };
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
    this.gimbal = { ...this.msg.gimbal };
    this._canvas = new OffscreenCanvas(500, 100);
    this._ctx2d = this._canvas.getContext('2d');
    this._ctx2d.font = '24px sans-serif';
  },
  mounted() {
    this.handleGestureMoveThrottled = throttle(this.handleGestureMove, 55);
    this.$nextTick(() => this.bindGestures());
  },
  beforeDestroy() {
    this.destroyJoystick();
    if (this._canvas) {
      this._ctx2d = null;
      this._canvas = null;
    }
  },
  components: {
    [Monitor.name]: Monitor
  }
};
</script>

<style>
.monitor .sd-card__action .el-dropdown {
  margin-left: 10px;
}
.monitor .el-card__body {
  user-select: none;
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
  transition-property: opacity;
  pointer-events: none;
}
.monitor-drone-control__target.single {
  background-color: #ffffffb2;
}
.monitor-drone-control__target.double {
  background-color: #409effb2;
}
.monitor-drone-control--vertical,
.monitor-drone-control--horizontal {
  float: right;
}
.monitor-drone-control .el-slider__marks-text {
  font-size: 12px;
  color: white;
  text-shadow: 0 0 6px black;
}
.monitor-drone-control--vertical .el-slider.is-vertical .el-slider__marks-text {
  left: -30px;
  width: 20px;
  text-align: right;
}
.monitor-drone-control .el-slider__stop {
  background-color: #E6A23C;
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
/* safari workarounds */
.sd--safari .monitor--full .monitor-drone-control {
  top: 18px;
  right: 4px;
  overflow: hidden;
}
</style>
