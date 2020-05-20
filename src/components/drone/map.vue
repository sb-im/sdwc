<template>
  <sd-map
    icon="map-marker"
    title="map.satellite"
    :path="msg.position"
    :markers="markers"
    :heatmap="msg.heatmap"
    :places="places"
    :follow="follow"
    selectable
    path-color="#909399"
    :popover-shown="popover.show"
    :marker-styling="styling"
    @map-move="handleMove"
    @map-change="handlePopoverCancel"
    @select-point="handlePointSelect"
    @cancel-point="handlePopoverCancel"
  >
    <template #action>
      <el-button
        :icon="`el-icon-location${follow ? '' : '-outline'}`"
        :type="follow ? 'primary' : 'default'"
        size="small"
        @click="handleFollow"
      >
        <span v-t="'map.follow'"></span>
      </el-button>
      <el-button icon="el-icon-delete" size="small" @click="handlePathClear">
        <span v-t="'map.clear'"></span>
      </el-button>
      <el-popover ref="popover" trigger="manual" popper-class="map__popover" v-model="popover.show">
        <div
          v-for="c of commands"
          :key="c.method"
          class="el-dropdown-menu__item"
          @click="handleCommand(c)"
          v-t="tt(c.method)"
        ></div>
        <div class="el-dropdown-menu__item el-dropdown-menu__item--divided" @click="handlePopoverCancel">
          <i class="el-icon-close"></i>
          <span v-t="'common.cancel'"></span>
        </div>
      </el-popover>
      <el-dialog :visible.sync="prompt.show">
        <span slot="title" v-t="tt(prompt.method)"></span>
        <el-form size="small" label-width="140px" :model="prompt.values" :rules="prompt.fields" ref="form">
          <el-form-item v-for="(val, key) of prompt.fields" :key="key" :prop="key">
            <template #label>
              <span v-t="tt(key)"></span>
            </template>
            <template #error>
              <div class="el-form-item__error" v-t="'air.map.invalid_input'"></div>
            </template>
            <el-input v-if="val.type === 'number'" v-model.number="prompt.values[key]" type="number" step="any">
              <template v-if="val.unit" #append>{{ val.unit }}</template>
            </el-input>
            <el-input v-else v-model="prompt.values[key]">
              <template v-if="val.unit" #append>{{ val.unit }}</template>
            </el-input>
          </el-form-item>
        </el-form>
        <div slot="footer">
          <el-button size="medium" @click="handlePromptCancel" v-t="'common.cancel'"></el-button>
          <el-button size="medium" type="primary" @click="handlePromptConfirm" v-t="'common.confirm'"></el-button>
        </div>
      </el-dialog>
    </template>
  </sd-map>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex';

import { MarkerStyling } from '@/constants/marker-styling';
import NodeMap from '@/components/map/map.vue';

/** @type {SDWC.DroneMapControl[]} */
const DefaultCommands = [
  {
    method: 'setROI',
    params: {
      lng: { type: 'number', required: true },
      lat: { type: 'number', required: true },
      height: { type: 'number', required: true, unit: 'm' }
    }
  },
  {
    method: 'setROInone'
  },
  {
    method: 'setTarget',
    params: {
      lng: { type: 'number', required: true },
      lat: { type: 'number', required: true },
      height: { type: 'number', required: true, unit: 'm' },
      speed: { type: 'number', required: true, default: 5, unit: 'm/s' }
    }
  },
  {
    method: 'mode_brake'
  }
];

export default {
  name: 'sd-drone-map',
  props: {
    info: {
      type: Object,
      required: true
    },
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
      follow: true,
      popover: {
        show: false,
        coordinate: null
      },
      prompt: {
        show: false,
        method: 'prompt',
        fields: {},
        values: {}
      }
    };
  },
  computed: {
    ...mapState([
      'preference'
    ]),
    ...mapGetters([
      'depots'
    ]),
    commands() {
      if (!this.point.params) return DefaultCommands;
      return this.point.params.common.move;
    },
    styling() {
      if (!this.point.params) return MarkerStyling;
      return this.point.params.common.place;
    },
    droneMarkers() {
      const markers = [];
      const position = this.msg.position[0];
      if (this.status.code === 0 && typeof position === 'object') {
        markers.push({
          type: 'drone',
          id: this.info.id,
          name: this.info.name,
          position,
          heading: position.heading
        });
      }
      return markers;
    },
    depotMarkers() {
      const markers = [];
      for (const d of this.depots) {
        const { code, status } = d.status;
        if (code === 0 && status.link_id === this.info.id) {
          markers.push({
            type: 'depot',
            id: d.info.id,
            name: d.info.name,
            position: {
              lng: +status.lng,
              lat: +status.lat,
            }
          });
        }
      }
      return markers;
    },
    placeMarkers() {
      const position = this.msg.position[0];
      const markers = [];
      if (!position || !position.place) return markers;
      for (const [name, pos] of Object.entries(position.place)) {
        const arr = Array.isArray(pos) ? pos : [pos];
        for (let i = 0; i < arr.length; i++) {
          markers.push({
            type: 'place',
            id: `${name}_${i}`,
            name,
            position: arr[i]
          });
        }
      }
      return markers;
    },
    markers() {
      return [...this.droneMarkers, ...this.depotMarkers, ...this.placeMarkers];
    },
    places() {
      const position = this.msg.position[0];
      const paths = [];
      if (!position || !position.place) return paths;
      const p = [position];
      for (const [name, pos] of Object.entries(position.place)) {
        paths.push({
          name,
          path: p.concat(pos)
        });
      }
      return paths;
    }
  },
  methods: {
    ...mapActions([
      'clearDronePath'
    ]),
    tt(k) {
      return this.$te(`air.map.${k}`) ? `air.map.${k}` : k;
    },
    handleFollow() {
      this.follow = !this.follow;
    },
    handleMove() {
      if (this.follow) {
        this.follow = false;
      }
    },
    handlePathClear() {
      this.clearDronePath(this.info.id);
    },
    handlePointSelect(latlng, el) {
      if (this.status.code !== 0 || this.commands.length <= 0) return;
      this.popover.coordinate = {
        lat: Math.floor(latlng.lat * 1e8) / 1e8,
        lng: Math.floor(latlng.lng * 1e8) / 1e8
      };
      if (!this.$refs.popover.popperJS) {
        this.$refs.popover.referenceElm = el;
        this.popover.show = true;
      } else if (this.popover.show) {
        this.$refs.popover.updatePopper();
      } else {
        this.popover.show = true;
      }
    },
    handlePopoverCancel() {
      this.popover.coordinate = null;
      this.popover.show = false;
    },
    /**
     * @param {SDWC.DroneMapControl} cmd
     */
    async handleCommand(cmd) {
      this.$refs.popover.doClose();
      const fields = { ...cmd.params };
      if (Object.getOwnPropertyNames(fields).length === 0) {
        return this.sendCommand(cmd.method);
      }
      const values = {};
      const knownValues = {
        ... this.popover.coordinate,
        height: this.msg.drone_status.height
      };
      for (const [k, v] of Object.entries(fields)) {
        if (typeof v.default === v.type) {
          values[k] = v.default;
        }
        if (Object.prototype.hasOwnProperty.call(knownValues, k) && typeof knownValues[k] === v.type) {
          values[k] = knownValues[k];
        }
      }
      this.prompt = {
        show: true,
        method: cmd.method,
        fields,
        values
      };
    },
    sendCommand(mission, arg) {
      this.$mqtt(this.info.id, { mission, arg }).catch(() => { /* noop */ });
    },
    handlePromptCancel() {
      this.prompt.show = false;
    },
    handlePromptConfirm() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.prompt.show = false;
          this.sendCommand(this.prompt.method, this.prompt.values);
        } else {
          // noop
        }
      });
    }
  },
  components: {
    [NodeMap.name]: NodeMap
  }
};
</script>

<style>
.map__popover {
  padding: 10px 0;
}
</style>
