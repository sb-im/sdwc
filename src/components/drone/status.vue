<template>
  <el-card class="drone__status sd-card sd-card--dense" shadow="never">
    <div class="status__item">
      <sd-icon value="drone" :size="18" />
      <span class="status__text">{{ flightStatus }}</span>
    </div>
    <div class="status__item">
      <sd-icon value="check-flag" :size="18" />
      <span class="status__text">{{ flightMode }}</span>
    </div>
    <div class="status__item">
      <sd-icon value="timespan" :size="18" />
      <span class="status__text">{{ flightTime }}</span>
    </div>
    <div class="status__item">
      <sd-icon value="speed" :size="18" />
      <span class="status__text">{{ flightSpeed }}</span>
    </div>
    <div class="status__item">
      <sd-icon value="battery-horizontal" :size="18" />
      <span class="status__text">{{ batteryPercentage }}</span>
    </div>
    <div class="status__item">
      <sd-icon value="voltage" :size="18" />
      <span class="status__text">{{ batteryVoltage }}</span>
    </div>
    <div class="status__item">
      <sd-icon value="height" :size="18" />
      <span class="status__text">{{ gpsHeight }}</span>
    </div>
    <div class="status__item">
      <sd-icon value="satellite" :size="18" />
      <span class="status__text">{{ gpsType }}</span>
    </div>
  </el-card>
</template>

<script>
import Icon from '@/components/sd-icon.vue';

export default {
  name: 'sd-drone-status',
  props: {
    msg: {
      type: Object,
      required: true
    }
  },
  computed: {
    status() {
      return this.msg.drone_status;
    },
    flightStatus() {
      return this.$t(`air.status.${this.status.status}`);
    },
    flightMode() {
      return this.$t(`air.mode.${this.status.mode}`);
    },
    flightTime() {
      const t = this.$d(new Date(Date.UTC(0, 0, 0, 0, 0, this.status.time)), 'elapsed');
      return this.$t('air.flight.time', { t });
    },
    flightSpeed() {
      const s = this.status.speed.toFixed(2);
      return this.$t('air.flight.speed', { s });
    },
    batteryPercentage() {
      const num = this.status.battery.percent.toFixed(1);
      return this.$t('air.battery.remain', { num });
    },
    batteryVoltage() {
      const num = this.status.battery.voltage.toFixed(2);
      return this.$t('air.battery.voltage', { num });
    },
    gpsHeight() {
      const h = this.status.height.toFixed(2);
      return this.$t('air.flight.height', { h });
    },
    gpsType() {
      const { satcount: num, type } = this.status.gps;
      return this.$t('air.gps.satellites', { num, type });
    }
  },
  components: {
    [Icon.name]: Icon
  }
};
</script>

<style>
.drone__status .el-card__body {
  display: flex;
  padding: 20px 0;
  justify-content: space-around;
}
.status__item {
  font-size: 14px;
  display: flex;
  align-items: center;
}
.status__text {
  margin-left: 4px;
}
</style>
