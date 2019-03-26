<template>
  <section class="control">
    <!-- <battery :node="node"></battery> -->
    <el-header class="header font-24">
      <img src="../../assets/images/airport/a_h_control.svg"/>{{ $t('common.advanced_control') }}
    </el-header>
    <el-row type="flex" class="content">
      <el-col tag="ul" class="status">
        <li class="font-18">{{ $t('common.status') }}：</li>
        <li>
          <img src="../../assets/images/airport/a_airport.svg"/>
          <el-button class="font-16" @click="seeStatus('air')" type="primary">{{ $t('common.air_status') }}</el-button>
        </li>
        <li>
          <img src="../../assets/images/airport/a_drone.svg"/>
          <el-button class="font-16" @click="seeStatus('depot')" type="primary">{{ $t('common.depot_status') }}</el-button>
        </li>
      </el-col>
      <el-col tag="table" class="operate">
        <tr>
          <td class="font-18">{{ $t('depot.motor_run') }}</td>
          <td class="text-c"><img src="../../assets/images/airport/a_airport.svg"/></td>
          <td class="text-c"><img src="../../assets/images/airport/a_charge.svg"/></td>
          <td class="text-c"><img src="../../assets/images/airport/a_fixed.svg"/></td>
          <td class="text-c"><img src="../../assets/images/airport/a_get.svg"/></td>
          <td class="text-c"><img src="../../assets/images/airport/a_reset.svg"/></td>
        </tr>
        <tr class="btns">
          <td><el-button @click.prevent="doMsission('stop')" class="d-b font-16" type="danger">=={{ $t('depot.emergency_stop') }}==</el-button></td>
          <td>
            <el-button @click.prevent="doMsission('dooropen')" class="d-b font-16" type="warning">{{ $t('depot.open_door') }}</el-button>
            <el-button @click.prevent="doMsission('doorclose')" class="d-b font-16" type="warning">{{ $t('depot.close_door') }}</el-button>
          </td>
          <td>
            <el-button @click.prevent="doMsission('power_chargedrone_on')" class="d-b font-16" type="warning">{{ $t('depot.start_charge') }}</el-button>
            <el-button @click.prevent="doMsission('power_chargedrone_off')" class="d-b font-16" type="warning">{{ $t('depot.stop_charge') }}</el-button>
          </td>
          <td>
            <el-button @click.prevent="doMsission('fixdrone')" class="d-b font-16" type="warning">{{ $t('depot.air_fixed') }}</el-button>
            <el-button @click.prevent="doMsission('freedrone')" class="d-b font-16" type="warning">{{ $t('depot.air_release') }}</el-button>
          </td>
          <td>
            <el-button @click.prevent="doMsission('pickdronebattery')" class="d-b font-16" type="warning">{{ $t('depot.air_bat_pickout') }}</el-button>
            <el-button @click.prevent="doMsission('mountdronebattery')" class="d-b font-16" type="warning">{{ $t('depot.air_bat_putin') }}</el-button>
          </td>
          <td><el-button @click.prevent="doMsission('reset')" class="d-b font-16" type="warning">{{ $t('depot.air_reset') }}</el-button></td>
        </tr>
      </el-col>
    </el-row>
    <section class="logs">
      <header class="header font-18">{{ $t('common.logs') }}：</header>
      <ul class="logs-content">
        <li v-for="(val,index) in airLogs" :key="index">{{ val }}</li>
        <li v-for="(val,index) in depotLogs" :key="index">{{ val }}</li>
      </ul>
    </section>
    <section class="debug">
      <p>{{ $t('common.debug_tips') }}</p>
      <el-button class="font-16" @click.prevent="doMsission('move_lift_drone')" type="danger">{{ $t('depot.platform_rise') }}</el-button>
      <el-button class="font-16" @click.prevent="doMsission('move_lift_convey')" type="danger">{{ $t('depot.platform_bottom') }}</el-button>
      <el-button class="font-16" @click.prevent="doMsission('riseplate')" type="danger">{{ $t('depot.platform_level') }}</el-button>
      <div class="btns f-r">
        <el-input class="f-l inp"></el-input>
        <el-button class="f-l font-16" type="danger">{{ $t('common.send') }}</el-button>
        <el-button class="f-l font-16">{{ $t('common.clear') }}</el-button>
      </div>
    </section>
  </section>
</template>

<script>
  import mqttClient from '../../config/mqtt';
  // import battery from './battery'
  export default {
    name: "DepotTerminal",
    data() {
      return {
        airLogs:[],
        depotLogs:[]
      }
    },
    components: {
      // 'battery': battery
    },
    props: {
      node:{
        type:Object,
        required: true,
        default: () => {}
      }
    },
    methods: {
      seeStatus(type) {
        switch (type) {
          case 'air':this.$store.state.statusLive && this.airLogs.push(this.$store.state.statusLive.payload);break;
          case 'depot':this.$store.state.statusLive && this.depotLogs.push(this.$store.state.statusLive.payload);break;
        }
      },
      doMsission(name) {
        const notification = this.$notify({
          duration: 0,
          type: 'info',
          title: name,
          message: this.$t('common.operate_pending')
        });
        mqttClient.invoke(this.node.id, name, [])
          .then(() => {
            notification.$data.type = 'success';
            notification.$data.message = this.$t('common.operate_success');
            notification.$data.duration = 2000;
            notification.startTimer();
          })
          .catch(() => {
            notification.$data.type = 'error';
            notification.$data.message = this.$t('common.operate_error');
          });
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
    width: calc(100% - 200px);
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
  .debug > p {
    position: relative;
    color: #999;
    margin-top: 10px;
    font-size: 14px;
    line-height: 26px;
  }
  .debug > p:before {
    content: '';
    position: absolute;
    top: 50%;
    right: 0;
    height: 1px;
    width: 81%;
    -webkit-transform: translateY(-50%);
    -moz-transform: translateY(-50%);
    -ms-transform: translateY(-50%);
    -o-transform: translateY(-50%);
    transform: translateY(-50%);
    background-color: #e4eaef
  }
  .debug .btns > .inp{
    width: auto;
    margin-right: 10px;
  }
</style>
