<template>
  <section class="control">
    <el-header class="header font-24">
      <img src="../../assets/images/drone/d_control.svg"/>{{ $t('common.advanced_control') }}
    </el-header>
    <el-row type="flex" class="high-content">
      <el-col tag="ul" class="status">
        <li class="font-18">{{ $t('common.status') }}：</li>
        <li>
          <img src="../../assets/images/drone/d_drone.svg"/>
          <el-button class="font-16" @click="seeStatus('air')" type="primary">{{ $t('common.air_status') }}</el-button>
        </li>
        <li>
          <img src="../../assets/images/drone/d_airport.svg"/>
          <el-button class="font-16" @click="seeStatus('depot')" type="primary">{{ $t('common.depot_status') }}</el-button>
        </li>
      </el-col>
      <el-col class="operate">
        <ul class="d-f">
          <li class="font-18">{{ $t('air.air_control') }}</li>
          <li class="text-c"><img src="../../assets/images/drone/d_fly.svg"/></li>
          <li class="text-c"><img src="../../assets/images/drone/d_return.svg"/></li>
          <li class="text-c"><img src="../../assets/images/drone/d_task.svg"/></li>
          <li class="text-c"><img src="../../assets/images/drone/d_updown.svg"/></li>
          <li class="text-c"><img src="../../assets/images/drone/d_spare.svg"/></li>
        </ul>
        <ul class="d-f btns">
          <li><el-button @click.prevent="doMsission('mode_loiter')" class="d-b font-16" type="danger">=={{ $t('air.air_hover') }}==</el-button></li>
          <li><el-button @click.prevent="doMsission('take_off')" class="d-b font-16" type="danger">{{ $t('air.air_takeoff') }}</el-button></li>
          <li><el-button @click.prevent="doMsission('model_rtl')" class="d-b font-16" type="danger">{{ $t('air.air_return') }}</el-button></li>
          <li><el-button @click.prevent="readyMsission" class="d-b font-16" type="danger">{{ $t('air.air_runplan') }}</el-button></li>
          <li>
            <el-button @click.prevent="doMsission('up_5')" class="d-b font-16" type="danger">{{ $t('air.air_up',{num:5}) }}</el-button>
            <el-button @click.prevent="doMsission('down_5')" class="d-b font-16" type="danger">{{ $t('air.air_down',{num:5}) }}</el-button>
          </li>
          <li><el-button @click.prevent="doMsission('land_bakup')" class="d-b font-16" type="danger">{{ $t('air.air_landpoint') }}</el-button></li>
        </ul>
      </el-col>
    </el-row>
    <section class="logs">
      <header class="header font-18">{{ $t('common.logs') }}：</header>
      <ul class="logs-content">
        <li v-for="(val,index) in logs" :key="index">{{ val }}</li>
      </ul>
    </section>
    <el-collapse class="debug">
      <el-collapse-item :title="$t('common.debug_tips')" name="1">
        <div class="collapse-content">
          <el-button class="font-16" @click.prevent="doMsission('land')" type="danger">{{ $t('air.air_land') }}</el-button>
          <el-tooltip class="item" effect="dark" :content="$t('air.air_emergency_stop_tips')" placement="top">
            <el-button class="font-16" @click.prevent="doMsission('emergency_stop')" type="danger">{{ $t('air.air_emergency_stop') }}</el-button>
          </el-tooltip>
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
  import mqttClient from '../../config/mqtt';
  export default {
    name: "AirTerminal",
    data() {
      return {
        command: ''
      }
    },
    props: {
      node:{
        type:Object,
        required: true,
        default: () => {}
      }
    },
    computed: {
      logs() {
        const nodeMsg = this.$store.state.nodeMessage.find(m => m.id == this.node.id);
        if (nodeMsg) {
          return nodeMsg.message;
        }
        return [];
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
        // store reference of notification
        const notification = this.$notify({
          duration: 0,
          type: 'info',
          title: name,
          message: this.$t('common.operate_pending')
        });
        return mqttClient.invoke(this.node.id, name, [])
          .then(() => {
            // modify notification icon and text
            notification.$data.type = 'success';
            notification.$data.message = this.$t('common.operate_success');
            // disappear after 2000ms
            // @see https://github.com/ElemeFE/element/blob/5ef3d0ec8d02872fc5de51d16ffe36af2700b11c/packages/notification/src/main.js#L11
            notification.$data.duration = 2000;
            notification.startTimer();
          })
          .catch(e => {
            notification.$data.type = 'error';
            notification.$data.message = this.$t('common.operate_error');
            return e;
          });
      },
      readyMsission() {
        // msgbox's reference can't be stored
        this.$msgbox({
          type: 'info',
          title: this.$t('common.system_tips'),
          message: this.$t('common.operate_pending'),
          confirmButtonText: this.$t('common.comfirm')
        });
        mqttClient.invoke(this.node.id, 'startmission_ready', [])
          .then(() => {
            // 'startmission_ready' returns 'OK'
            this.$msgbox.close();
            this.$confirm(this.$t('common.plan_ready'), {
              type: 'warning',
              title: this.$t('common.system_tips'),
              confirmButtonText: this.$t('common.comfirm'),
              cancelButtonText: this.$t('common.cancel')
            }).then(() => {
              // startmission when user confirm
              this.doMsission('startmission');
            });
          })
          .catch(e => {
            // 'startmission_ready' failed
            this.$msgbox.close();
            const h = this.$createElement;
            // message can be VNode
            const message = h('div', [
              h('p', this.$t('common.operate_error')),
              h('p', `${e.code}: ${e.message}`)
            ]);
            this.$alert(message, {
              type: 'error',
              title: this.$t('common.system_tips'),
              confirmButtonText: this.$t('common.comfirm')
            }).catch(() => { /* noop */ });
          });
      }
    }
  }
</script>

<style scoped>
  .header {border-bottom: 1px solid #e4eaef;}
  .header img{
    width: 30px;
    height: 30px;
    padding-right: 8px;
  }
  .control {
    padding: 0 15px 15px;
  }
  .control .header {
    padding: 0 10px;
    line-height: 60px;
  }
  .control .high-content {padding-top: 15px;}
  .control .status {
    width: 200px;
    border-right: 1px solid #e4eaef;
  }
  .control .operate ul:first-child,
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
  .control .operate ul:first-child{padding-bottom: 10px;}
  .control .operate li {
    width: calc(100% / 6);
  }
  .control .operate li img {
    width: 40px;
    height: 40px;
  }
  .control .operate .btns li button{
    width: 120px;
    height: 45px;
    padding: 0;
    margin: 0 auto;
  }
  .control .operate .btns li button:first-child {margin-bottom: 10px;}
  .control .operate .btns li:last-child button,
  .control .operate .btns li:first-child button {
    width: 115px;
    height: 100px;
  }
  .control .operate .btns li:first-child button{margin: 0;}
  .control.high .operate .btns li:last-child button {margin: 0 auto;}

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
