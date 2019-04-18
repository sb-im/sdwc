<template>
  <section class="control">
    <!-- <battery :node="node"></battery> -->
    <el-header class="header font-24">
      <img src="../../assets/images/airport/a_h_control.svg"/>{{ $t('common.advanced_control') }}
    </el-header>
    <el-row class="content">
      <el-col tag="table" class="operate">
        <tr>
          <td class="font-18">{{ $t('depot.motor_run') }}</td>
          <td class="text-c"><img src="../../assets/images/airport/a_airport.svg"/></td>
          <td class="text-c"><img src="../../assets/images/airport/a_charge.svg"/></td>
          <td class="text-c"><img src="../../assets/images/airport/a_fixed.svg"/></td>
          <!-- <td class="text-c"><img src="../../assets/images/airport/a_get.svg"/></td>
          <td class="text-c"><img src="../../assets/images/airport/a_reset.svg"/></td> -->
        </tr>
        <tr class="btns">
          <td><el-button @click.prevent="doMsission($t('depot.emergency_stop'), 'ncp', ['shell', 'stop'])" class="d-b font-16" type="danger">=={{ $t('depot.emergency_stop') }}==</el-button></td>
          <td>
            <el-button @click.prevent="doMsission($t('depot.open_door'), 'dooropen')" class="d-b font-16" type="warning">{{ $t('depot.open_door') }}</el-button>
            <el-button @click.prevent="doMsission($t('depot.close_door'), 'doorclose')" class="d-b font-16" type="warning">{{ $t('depot.close_door') }}</el-button>
          </td>
          <td>
            <el-button @click.prevent="doMsission($t('depot.start_charge'), 'power_chargedrone_on')" class="d-b font-16" type="warning">{{ $t('depot.start_charge') }}</el-button>
            <el-button @click.prevent="doMsission($t('depot.stop_charge'), 'power_chargedrone_off')" class="d-b font-16" type="warning">{{ $t('depot.stop_charge') }}</el-button>
          </td>
          <td>
            <el-button @click.prevent="doMsission($t('depot.air_fixed'), 'fixdrone')" class="d-b font-16" type="warning">{{ $t('depot.air_fixed') }}</el-button>
            <el-button @click.prevent="doMsission($t('depot.air_release'), 'freedrone')" class="d-b font-16" type="warning">{{ $t('depot.air_release') }}</el-button>
          </td>
          <td>
            <!-- <el-button @click.prevent="doMsission($t('depot.air_bat_pickout'), 'pickdronebattery')" class="d-b font-16" type="warning">{{ $t('depot.air_bat_pickout') }}</el-button>
            <el-button @click.prevent="doMsission($t('depot.air_bat_putin'), 'mountdronebattery')" class="d-b font-16" type="warning">{{ $t('depot.air_bat_putin') }}</el-button> -->
          </td>
          <!-- <td><el-button @click.prevent="doMsission($t('depot.air_reset'), 'reset')" class="d-b font-16" type="warning">{{ $t('depot.air_reset') }}</el-button></td> -->
        </tr>
      </el-col>
    </el-row>
    <section class="logs">
      <header class="header font-18">{{ $t('common.logs') }}：</header>
      <ul class="logs-content">
        <li v-for="(val,index) in logs" :key="index">{{ val }}</li>
      </ul>
    </section>
    <el-collapse>
      <el-collapse-item class="debug" :title="$t('common.debug_tips')" name="1">
        <div class="collapse-content">
          <!-- <el-button class="font-16" @click="doMsission($t('depot.platform_rise'), 'move_lift_drone')" type="danger">{{ $t('depot.platform_rise') }}</el-button>
          <el-button class="font-16" @click="doMsission($t('depot.platform_bottom'), 'move_lift_convey')" type="danger">{{ $t('depot.platform_bottom') }}</el-button>
          <el-button class="font-16" @click="doMsission($t('depot.platform_level'), 'riseplate')" type="danger">{{ $t('depot.platform_level') }}</el-button> -->
          <el-button class="font-16" @click="doMsission($t('depot.get_status'),'get_status')" type="danger">{{ $t('depot.get_status') }}</el-button>
          <el-button class="font-16" @click="doMsission($t('depot.move_x_open'),'move_x_open')" type="danger">{{ $t('depot.move_x_open') }}</el-button>
          <el-button class="font-16" @click="doMsission($t('depot.move_x_close'),'move_x_close')" type="danger">{{ $t('depot.move_x_close') }}</el-button>
          <el-button class="font-16" @click="doMsission($t('depot.move_y_open'),'move_y_open')" type="danger">{{ $t('depot.move_y_open') }}</el-button>
          <el-button class="font-16" @click="doMsission($t('depot.move_y_close'),'move_y_close')" type="danger">{{ $t('depot.move_y_close') }}</el-button>
          <!-- <el-button class="font-16" @click="doMsission($t('depot.power_ir_on'),'power_ir_on')" type="danger">{{ $t('depot.power_ir_on') }}</el-button>
          <el-button class="font-16" @click="doMsission($t('depot.power_ir_off'),'power_ir_off')" type="danger">{{ $t('depot.power_ir_off') }}</el-button> -->
          <el-button class="font-16" @click="doMsission($t('depot.power_doorlock_f_on'),'power_doorlock_f_on')" type="danger">{{ $t('depot.power_doorlock_f_on') }}</el-button>
          <el-button class="font-16" @click="doMsission($t('depot.power_doorlock_f_off'),'power_doorlock_f_off')" type="danger">{{ $t('depot.power_doorlock_f_off') }}</el-button>
          <el-button class="font-16" @click="doMsission($t('depot.power_doorlock_b_on'),'power_doorlock_b_on')" type="danger">{{ $t('depot.power_doorlock_b_on') }}</el-button>
          <el-button class="font-16" @click="doMsission($t('depot.power_doorlock_b_off'),'power_doorlock_b_off')" type="danger">{{ $t('depot.power_doorlock_b_off') }}</el-button>
          <div class="side">
            <el-input v-model="command" clearable>
              <el-button type="danger" slot="append">{{ $t('common.send') }}</el-button>
            </el-input>
          </div>
        </div>
      </el-collapse-item>
    </el-collapse>
  </section>
</template>

<script>
  // import battery from './battery'
  import base from '../base_terminal.vue';
  export default {
    name: "DepotTerminal",
    extends: base,
    data() {
      return {
        command: ''
      }
    },
    components: {
      // 'battery': battery
    },
    props: {
      node:{
        type: Object,
        required: true
      }
    },
    computed: {
      logs() {
        const nodeMsg = this.$store.state.nodeMessage.find(m => m.id == this.node.id);
        if (nodeMsg) {
          return nodeMsg.log;
        }
        return [];
      }
    }
  }
</script>

<style scoped>
  .header {
    line-height: 60px;
    padding: 0 10px;
    border-bottom: 1px solid #e4eaef;
  }
  .header img {
    width: 35px;
    height: 35px;
    padding-right: 10px;
  }
  .control {padding: 0 15px 15px;}
  .control content {padding-top: 15px;}
  .control .status {
    width: 200px;
    border-right: 1px solid #e4eaef;
  }
  .control .operate tr:first-child,
  .control .status li {
    height: 52px;
    line-height: 52px;
  }
  .control .status li button {width: 120px;}
  .control .status img{
    width: 40px;
    height: 40px;
    padding-right: 10px;
  }
  .control .operate {
    margin-left: 20px;
  }
  .control .status li:first-child,
  .control .operate tr:first-child td{padding-bottom: 10px;}
  .control .operate td {
    width: calc(100% / 6);
  }
  .control .operate td img {
    width: 40px;
    height: 40px;
  }
  .control .operate .btns td button{
    width: 120px;
    height: 45px;
    padding: 0;
    margin: 0 auto;
  }
  .control .operate .btns td button:first-child {margin-bottom: 10px;}
  .control .operate .btns td:last-child button,
  .control .operate .btns td:first-child button {
    width: 115px;
    height: 100px;
  }
  .control .operate .btns td:first-child button{margin: 0;}
  .control .operate .btns td:last-child button {margin: 0 auto;}

  .logs > .header {
    border-bottom: 0;
    line-height: 46px;
    padding: 0;
  }
  .logs-content {
    width: 100%;
    height: 300px;
    padding: 5px;
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
    border: 1px solid #e4eaef;
    overflow-y: auto;
  }
  .logs-content li {
    line-height: 18px;
    color: #999;
  }
  .debug .collapse-content {
    display: flex;
  }
  .debug .collapse-content .side {
    margin-left: auto;
  }
</style>
