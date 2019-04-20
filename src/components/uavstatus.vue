<template>
  <el-header height="60px" class="header">
    <div><img src="../assets/images/drone/d_mode.svg"/><span>{{ flightMode }}</span></div>
    <div><img src="../assets/images/drone/d_time.svg"/>{{ flightTime }}</div>
    <div><img src="../assets/images/drone/d_electricity.svg"/>{{ batteryRemain }}</div>
    <div><img src="../assets/images/drone/d_voltage.svg"/>{{ batteryVoltage }}</div>
    <div><img src="../assets/images/drone/d_speed.svg"/>{{ flightSpeed }}</div>
    <div><img src="../assets/images/drone/d_height.svg"/>{{ flightHeight }}</div>
    <div><img src="../assets/images/drone/d_satellite.svg"/>{{ gpsInfo }}</div>
  </el-header>
</template>
<script>
  export default {
    props: {
      status: {
        type: Object,
        required: false,
        default: () => ({
          battery: { voltage: 0, remain: 0 },
          gps: { satellites: 0, height: 0, lat: 0, type: 0, lon: 0 },
          mount: { yaw: 0, pitch: 0 },
          flight: { status: 0, mode: 0, speed: 0, time: 0 }
        })
      }
    },
    data() {
      return {
        gpsType: {
          0: 'NO GPS',
          1: 'NO FIX',
          2: '2D FIX',
          3: '3D FIX',
          4: 'DGPS',
          5: 'RTK FLOAT',
          6: 'RTK FIX'
        }

      }
    },
    mounted() {

    },
    computed: {
      flightMode() {
        switch (+(this.status.flight.mode)) {
          case 0:return this.$t('air.mode_stabilize');
          case 3:return this.$t('air.mode_auto');
          case 4:return this.$t('air.mode_guide');
          case 5:return this.$t('air.mode_fixed');
          case 6:return this.$t('air.mode_back');
          case 9:return this.$t('air.mode_land');
          default:return this.$t('air.mode_');
        }
      },
      flightTime() {return this.status.flight.time ? this.$t('air.flight_time',{t:this.secTime(this.status.flight.time)}) : this.$t('air.flight_time',{t:'--:--'});},
      flightSpeed() {return this.status.flight.speed ? this.$t('air.flight_speed',{s:parseFloat(this.status.flight.speed).toFixed(2)+'m/s'}) : this.$t('air.flight_speed',{s:'--m/s'});},
      flightHeight() {return this.status.gps.height ? this.$t('air.flight_height',{h:parseFloat(this.status.gps.height).toFixed(2)+'m'}) : this.$t('air.flight_height',{h:'--m'});},
      batteryRemain() {return this.status.battery.remain ? this.$t('air.battery_remain',{num:parseFloat(this.status.battery.remain).toFixed(1)+'%'}) : this.$t('air.battery_remain',{num:'--%'});},
      batteryVoltage() {return this.status.battery.voltage ? this.$t('air.battery_voltage',{num:(parseFloat(this.status.battery.voltage)).toFixed(2)+'V'}) : this.$t('air.battery_voltage',{num:'--V'});},
      gpsInfo() {
        return (this.status.gps.satellites ? this.$t('air.gps_satellites',{num:this.status.gps.satellites}) : this.$t('air.gps_satellites',{num:'--'})) +
          (this.status.gps.type ? `${this.gpsType[this.status.gps.type]}` : '--');
      }
    },
    methods:{
      secTime(s) {
        let M = Math.floor(s/60)%60 < 10 ? `0${Math.floor(s/60) % 60}` : Math.floor(s/60) % 60,
          S = s%60 < 10 ? `0${s % 60}` : s % 60;
        return `${M}:${S}`;
      }
    }
  }
</script>

<style scoped>
  .header {border-bottom: 1px solid #e4eaef;}
  .header {
    display: flex;
    justify-content: space-evenly;
    padding: 0 10px;
    line-height: 60px;
  }
  .header img{
    width: 30px;
    height: 30px;
    margin-right: 8px;
  }
</style>

