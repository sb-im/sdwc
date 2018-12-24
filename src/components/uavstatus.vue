<template>
  <el-header height="45px" class="header">
    <img src="../assets/images/drone/d_tname.svg"/>安防例行巡检
    <ul v-if="$store.state.statusLive && $store.state.statusLive.payload" v-cloak class="f-r d-f">
      <li v-if="$store.state.statusLive.payload.flight" v-cloak><img src="../assets/images/drone/d_mode.svg"/><span>{{ flightMode }}</span></li>
      <li v-if="$store.state.statusLive.payload.flight" v-cloak><img src="../assets/images/drone/d_time.svg"/>{{ flightTime }}</li>
      <li v-if="$store.state.statusLive.payload.battery" v-cloak><img src="../assets/images/drone/d_electricity.svg"/>{{ batteryRemain }}</li>
      <li v-if="$store.state.statusLive.payload.battery" v-cloak><img src="../assets/images/drone/d_voltage.svg"/>{{ batteryVoltage }}</li>
      <li v-if="$store.state.statusLive.payload.flight" v-cloak><img src="../assets/images/drone/d_speed.svg"/>{{ flightSpeed }}</li>
      <li v-if="$store.state.statusLive.payload.gps" v-cloak><img src="../assets/images/drone/d_height.svg"/>{{ flightHeight }}</li>
      <li v-if="$store.state.statusLive.payload.gps" v-cloak><img src="../assets/images/drone/d_satellite.svg"/>{{ gpsInfo }}</li>
    </ul>
  </el-header>
</template>
<script>
  export default {
    data() {
      return {
        gpsType: {
          0: '--',
          1: '--',
          2: '--',
          3: 'GPS FIX',
          4: 'RTK DGPS',
          5: 'RTK FLOAT',
          6: 'RTK FIX'
        }

      }
    },
    mounted() {

    },
    computed: {
      flightMode() {
        switch (+(this.$store.state.statusLive.payload.flight.mode)) {
          case 3:return '自动模式';
          case 4:return '引导模式';
          case 5:return '定点模式';
          case 6:return '返航模式';
          case 9:return '降落模式';
          default:return '--模式';
        }
      },
      flightTime() {return this.$store.state.statusLive.payload.flight.time ? `飞行${this.secTime(this.$store.state.statusLive.payload.flight.time)}` : '飞行--:--';},
      flightSpeed() {return this.$store.state.statusLive.payload.flight.speed ? `速度${parseFloat(this.$store.state.statusLive.payload.flight.speed).toFixed(2)}m/s` : '速度--m/s';},
      flightHeight() {return this.$store.state.statusLive.payload.gps.height ? `高度${parseFloat(this.$store.state.statusLive.payload.gps.height).toFixed(2)}m` : '高度--m';},
      batteryRemain() {return this.$store.state.statusLive.payload.battery.remain ? `电量${this.$store.state.statusLive.payload.battery.remain}%` : '电量--%';},
      batteryVoltage() {return this.$store.state.statusLive.payload.battery.voltage ? `电压${(this.$store.state.statusLive.payload.battery.voltage*Math.pow(10,-3)).toFixed(2)}V` : '电压--V';},
      gpsInfo() {
        return (this.$store.state.statusLive.payload.gps.satellites ? `${this.$store.state.statusLive.payload.gps.satellites}星 ` : '--星 ') +
          (this.$store.state.statusLive.payload.gps.type ? `${this.gpsType[this.$store.state.statusLive.payload.gps.type]}` : '--');
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
    padding: 0 10px;
    line-height: 45px;
  }
  .header img{
    width: 30px;
    height: 30px;
    padding-right: 8px;
  }
  .header li {padding-right: 12px;}
</style>

