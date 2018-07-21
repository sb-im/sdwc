<template>
  <fieldset>
    <legend>状态信息</legend>

    <div v-if="uav_status['VFR_HUD']">Alt: {{ uav_status['VFR_HUD']['alt'] }} m</div>
    <div v-if="uav_status['VFR_HUD']">Speed: {{ uav_status['VFR_HUD']['airspeed'] }} m/s</div>
    <div v-if="uav_status['SYS_STATUS']">Power: {{ uav_status['SYS_STATUS']['voltage_battery']*0.1e-2 }}</div>
    <div v-if="uav_status['GPS_RAW_INT']">GPS: {{ uav_status['GPS_RAW_INT']['satellites_visible'] }}</div>
    <div v-if="uav_status['GPS_RAW_INT']">FIX: {{ fix_type[uav_status['GPS_RAW_INT']['fix_type']] }}</div>
  </fieldset>
</template>
<script>

  export default {
    data() {
      return {
        fix_type: [
          "NO_GPS",
          "NO_FIX",
          "2D_FIX",
          "3D_FIX",
          "DFIX",
          "RTK_FLOAT",
          "RTK_FIXED"
        ]
      }
    },
    props: {
      uav_status: {
        type: Object,
        default: Object
      }
    }
  }
</script>

