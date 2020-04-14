<template>
  <sd-map
    icon="map-marker"
    title="map.satellite"
    :markers="markers"
    :path="msg.position"
    :places="places"
    :follow="follow"
    selectable
    path-color="#909399"
    :popover-shown="popover.show"
    :marker-styling="styling"
    @map-change="handleCancel"
    @map-move="handleMove"
    @select-point="handleSelect"
    @cancel-point="handleCancel"
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
          v-t="$te(`air.map.${c.method}`) ?`air.map.${c.method}`: c.method "
        ></div>
        <div class="el-dropdown-menu__item el-dropdown-menu__item--divided" @click="handleCancel">
          <i class="el-icon-close"></i>
          <span v-t="'common.cancel'"></span>
        </div>
      </el-popover>
    </template>
  </sd-map>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex';

import NodeMap from '@/components/map/map.vue';

/** @type {SDWC.DroneMapControl[]} */
const DefaultCommands = [
  {
    method: 'setTarget',
    params: {
      lng: { type: 'number', required: true },
      lat: { type: 'number', required: true }
    }
  },
  {
    method: 'setROI',
    params: {
      lng: { type: 'number', required: true },
      lat: { type: 'number', required: true },
      height: { type: 'number', required: false }
    }
  },
  {
    method: 'setROInone'
  },
  {
    method: 'setTargetHeight',
    params: {
      lng: { type: 'number', required: true },
      lat: { type: 'number', required: true },
      height: { type: 'number', required: false }
    }
  }
];

/** @type {SDWC.DroneMapStyling[]} */
const DefaultStyling = {
  target: { stroke: 'dotted', color: '#409eff' },
  roi: { point: 'glow', color: '#f69730' },
  home: { color: '#67c23a' }
};

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
      if (!this.point.params) return DefaultStyling;
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
    handleSelect(latlng, el) {
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
    handleCancel() {
      this.popover.coordinate = null;
      this.popover.show = false;
    },
    /**
     * @param {string} k
     * @param {SDWC.DroneMapControlParamDescriptor} v
     */
    async promptParamInput(k, v) {
      return this.$prompt(`${k}: ${v.type}`, {
        title: this.$t('air.map.prompt'),
        inputValue: (v.default || '').toString(),
        inputValidator: str => {
          if (str.length === 0) {
            return !v.required;
          }
          if (v.type === 'number') {
            const num = Number.parseFloat(str);
            return !Number.isNaN(num) && Number.isFinite(num) && num.toString() === str;
          }
          return true;
        },
        inputErrorMessage: this.$t('air.map.invalid_input'),
        closeOnClickModal: false,
      }).then(({ value }) => {
        if (value.length === 0 && !v.required) {
          // `undefined` value won't be serialized to JSON
          return undefined;
        }
        if (v.type === 'number') {
          return Number.parseFloat(value);
        }
        return value;
      });
    },
    /**
     * @param {SDWC.DronMapControl} cmd
     */
    async handleCommand(cmd) {
      this.$refs.popover.doClose();
      const cord = this.popover.coordinate;
      let arg;
      for (const [k, v] of Object.entries(cmd.params || {})) {
        if (!arg) arg = {};
        if (Object.prototype.hasOwnProperty.call(cord, k) && typeof cord[k] === v.type) {
          arg[k] = cord[k];
        } else {
          let input;
          try {
            input = await this.promptParamInput(k, v);
          } catch (e) {
            // prompt canceled
            return;
          }
          arg[k] = input;
        }
      }
      this.$mqtt(this.info.id, {
        mission: cmd.method,
        arg
      }).catch(() => { /* noop */ });
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
