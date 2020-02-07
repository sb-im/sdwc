<template>
  <sd-map
    :markers="markers"
    :path="path"
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
    drone: {
      type: Object,
      required: true
    },
    path: {
      type: Array,
      required: true
    },
    /**
     * heading/height info
     */
    msg: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      follow: true,
      point: null
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
    markers() {
      const markers = [
        {
          type: 'drone',
          id: this.drone.id,
          name: this.drone.name,
          position: this.path[0],
          heading: this.msg.status ? this.msg.status.flight.heading : 0
        }
      ];
      for (const d of this.depots) {
        if (d.status === 0
          && d.msg.status
          && d.msg.status.link_id === this.drone.id
        ) {
          markers.push({
            type: 'depot',
            id: d.info.id,
            name: d.info.name,
            position: d.position
          });
        }
      }
      return markers;
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
      this.clearDronePath(this.drone.id);
    },
    handleSelect(latlng, el) {
      this.point = {
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
      this.point = null;
      this.$refs.popover.doClose();
    },
    async handleCommand(cmd) {
      this.$refs.popover.doClose();
      let arg = Object.assign({}, this.point);
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
      this.$mqtt(this.drone.id, {
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
