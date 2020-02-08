<template>
  <sd-map
    :markers="markers"
    :path="msg.position"
    :follow="follow"
    @map-change="handleCancel"
    @select-point="handleSelect"
    @cancel-point="handleCancel"
  >
    <template #action>
      <el-button
        :icon="follow ? 'el-icon-location' : 'el-icon-location-outline'"
        size="small"
        @click="handleFollow"
      >{{ $t(`map.${follow ? 'follow' : 'manual'}`) }}</el-button>
      <el-button icon="el-icon-delete" size="small" @click="handlePathClear">{{ $t('map.clear') }}</el-button>
      <el-popover ref="popover" trigger="manual" popper-class="map__popover">
        <div
          v-for="cmd in MapCommands"
          :key="cmd"
          class="el-dropdown-menu__item"
          @click="handleCommand(cmd)"
        >{{ $t(`air.${cmd}`) }}</div>
        <div class="el-dropdown-menu__item el-dropdown-menu__item--divided" @click="handleCancel">
          <i class="el-icon-close"></i>
          {{ $t('common.cancel') }}
        </div>
      </el-popover>
    </template>
  </sd-map>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex';

import NodeMap from '@/components/map/map.vue';

const MapCommands = [
  'gotoGPS',
  'pointtoGPS',
  'gotorelaltGPS'
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
      coordinate: null
    };
  },
  computed: {
    ...mapState([
      'preference'
    ]),
    ...mapGetters([
      'depots'
    ]),
    MapCommands() {
      return MapCommands;
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
    markers() {
      return [...this.droneMarkers, ...this.depotMarkers];
    }
  },
  methods: {
    ...mapActions([
      'setPreference',
      'clearDronePath'
    ]),
    handleFollow() {
      this.follow = !this.follow;
      this.setPreference({ mapFollow: this.follow });
    },
    handlePathClear() {
      this.clearDronePath(this.info.id);
    },
    handleSelect(latlng, el) {
      this.coordinate = {
        lat: Math.floor(latlng.lat * 1e8) / 1e8,
        lon: Math.floor(latlng.lng * 1e8) / 1e8
      };
      const p = this.$refs.popover;
      p.referenceElm = el;
      if (!p.showPopover) {
        p.doShow();
      }
      p.updatePopper();
    },
    handleCancel() {
      this.coordinate = null;
      this.$refs.popover.doClose();
    },
    async handleCommand(cmd) {
      this.$refs.popover.doClose();
      let arg = Object.assign({}, this.coordinate);
      if (cmd === 'gotorelaltGPS') {
        const input = this.$prompt(this.$t('air.input_alt'), {
          title: this.$t('air.gotorelaltGPS'),
          type: 'info',
          inputValue: `${this.msg.status ? this.msg.status.gps.height : 0}`,
          inputValidator: str => {
            let num = Number.parseFloat(str);
            return !Number.isNaN(num) && Number.isFinite(num) && num.toString() === str;
          },
          inputErrorMessage: this.$t('air.invalid_alt_input'),
          closeOnClickModal: false,
        }).then(({ value }) => {
          const num = Number.parseFloat(value);
          arg.relalt = num;
        });
        try {
          await input;
        } catch (e) {
          return;
        }
      }
      this.$mqtt(this.info.id, {
        mission: cmd,
        arg
      }).catch(() => { /* noop */ });
    }
  },
  created() {
    this.follow = this.preference.mapFollow;
  },
  components: {
    [NodeMap.name]: NodeMap
  }
};
</script>

<style>
.map__popover {
  padding: 10px 0;
  width: 180px;
}
</style>
