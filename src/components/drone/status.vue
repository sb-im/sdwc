<template>
  <el-card class="sd-card" shadow="never">
    <div class="sd-drone-status">
      <div class="sd-drone-status_item">
        <sd-icon value="drone/d_drone"/>
        <span class="sd-drone-status_text">{{ flightStatus }}</span>
      </div>
      <div class="sd-drone-status_item">
        <sd-icon value="drone/d_mode"/>
        <span class="sd-drone-status_text">{{ flightMode }}</span>
      </div>
      <div class="sd-drone-status_item">
        <sd-icon value="drone/d_time"/>
        <span class="sd-drone-status_text">{{ flightTime }}</span>
      </div>
      <div class="sd-drone-status_item">
        <sd-icon value="drone/d_speed"/>
        <span class="sd-drone-status_text">{{ flightSpeed }}</span>
      </div>
      <div class="sd-drone-status_item">
        <sd-icon value="drone/d_electricity"/>
        <span class="sd-drone-status_text">{{ batteryPercentage }}</span>
      </div>
      <div class="sd-drone-status_item">
        <sd-icon value="drone/d_voltage"/>
        <span class="sd-drone-status_text">{{ batteryVoltage }}</span>
      </div>
      <div class="sd-drone-status_item">
        <sd-icon value="drone/d_height"/>
        <span class="sd-drone-status_text">{{ gpsHeight }}</span>
      </div>
      <div class="sd-drone-status_item">
        <sd-icon value="drone/d_satellite"/>
        <span class="sd-drone-status_text">{{ gpsType }}</span>
      </div>
    </div>
  </el-card>
</template>

<script>
import Icon from '@/components/sd-icon.vue';

const EmptyStatus = {
  battery: { voltage: 0, remain: 0 },
  gps: { satellites: 0, height: 0, lat: 0, type: 0, lon: 0 },
  mount: { yaw: 0, pitch: 0 },
  flight: { status: 0, mode: 0, speed: 0, time: 0 }
};

const FlightStatus = {
  3: 'air.status_standby',
  4: 'air.status_flying',
  5: 'air.status_error',
  none: 'air.status_'
};

const FlightMode = {
  3: 'air.mode_auto',
  4: 'air.mode_guide',
  5: 'air.mode_fixed',
  6: 'air.mode_back',
  9: 'air.mode_land',
  none: 'air.mode_'
};

const GPSType = {
  0: 'NO GPS',
  1: 'NO FIX',
  2: '2D FIX',
  3: '3D FIX',
  4: 'DGPS',
  5: 'RTK FLOAT',
  6: 'RTK FIX',
  none: '--'
};

export default {
  name: 'sd-node-drone-status',
  props: {
    node: {
      type: Object,
      required: true
    },
    message: {
      type: Array,
      required: true
    }
  },
  computed: {
    status() {
      if (this.message.length === 0) {
        return EmptyStatus;
      }
      return this.message[0].status;
    },
    flightStatus() {
      const key = FlightStatus[this.status.flight.status] || FlightStatus.none;
      return this.$t(key);
    },
    flightMode() {
      const key = FlightMode[this.status.flight.mode] || FlightMode.none;
      return this.$t(key);
    },
    flightTime() {
      const t = this.$d(new Date(Date.UTC(0, 0, 0, 0, 0, this.status.flight.time)), 'time');
      return this.$t('air.flight_time', { t });
    },
    flightSpeed() {
      const s = this.status.flight.speed.toFixed(2) + 'm/s';
      return this.$t('air.flight_speed', { s });
    },
    batteryPercentage() {
      const num = this.status.battery.remain.toFixed(1) + '%';
      return this.$t('air.battery_remain', { num });
    },
    batteryVoltage() {
      const num = this.status.battery.voltage.toFixed(2) + 'V';
      return this.$t('air.battery_voltage', { num });
    },
    gpsHeight() {
      const h = this.status.gps.height.toFixed(2) + 'm';
      return this.$t('air.flight_height', { h });
    },
    gpsType() {
      const num = this.status.gps.satellites;
      const type = GPSType[this.status.gps.type] || GPSType.none;
      return this.$t('air.gps_satellites', { num }) + ' ' + type;
    }
  },
  components: {
    [Icon.name]: Icon
  }
};
</script>

<style>
.sd-drone-status {
  display: flex;
  justify-content: space-around;
}
.sd-drone-status_item {
  display: flex;
  justify-content: center;
}
.sd-drone-status_text {
  margin-left: 4px;
}
</style>
