<template>
  <section class="battery">
    <el-header class="header font-24">
      <img src="../../assets/images/airport/a_control.svg"/>{{ $t('common.control') }}
    </el-header>
    <el-row>
      <el-col :span="12" class="bat-left">
        <el-col :span="5" class="bat-box text-c">
          <img src="../../assets/images/airport/a_battery.svg"/>
          <p>{{ $t('depot.battery',{i:'A'}) }}</p>
        </el-col>
        <el-col :span="19" class="infos" tag="ul">
          <li class="d-f">
            <div class="item-label">{{ $t('depot.cycle') }}</div>
            <div class="item-text">
              <span>100</span>
              <span>{{ $t('depot.status_normal') }}</span>
            </div>
          </li>
          <li class="d-f">
            <div class="item-label">{{ $t('common.status') }}</div>
            <div class="item-text status">
              <el-progress :text-inside="true" :stroke-width="20" :percentage="100" status="success"></el-progress>
            </div>
          </li>
          <li class="d-f">
            <div class="item-label">{{ $t('depot.maintain') }}</div>
            <div class="item-text pos-r">
              <img class="pos-a" src="../../assets/images/airport/a_maintain.svg"/>
              <el-button class="font-16" @click.prevent="doMsission('pickabattery')" type="danger">{{ $t('depot.putin') }}</el-button>
              <el-button class="font-16" @click.prevent="doMsission('mountabattery')" type="danger">{{ $t('depot.pickout') }}</el-button>
            </div>
          </li>
          <li class="d-f">
            <div class="item-label">{{ $t('depot.debug') }}</div>
            <div class="item-text debug pos-r">
              <img class="pos-a" src="../../assets/images/airport/a_charging.svg"/>
              <el-button class="font-16" @click.prevent="doMsission('power_chargedrone_on')" type="warning">{{ $t('depot.start_charge') }}</el-button>
              <el-button class="font-16" @click.prevent="doMsission('power_chargedrone_off')" type="warning">{{ $t('depot.stop_charge') }}</el-button>
            </div>
          </li>
        </el-col>
      </el-col>
      <el-col :span="12">
        <el-col :span="5" class="bat-box text-c">
          <img src="../../assets/images/airport/a_battery.svg"/>
          <p>{{ $t('depot.battery',{i:'B'}) }}</p>
        </el-col>
        <el-col :span="19" class="infos" tag="ul">
          <li class="d-f">
            <div class="item-label">{{ $t('depot.cycle') }}</div>
            <div class="item-text">
              <span>100</span>
              <span>{{ $t('depot.status_normal') }}</span>
            </div>
          </li>
          <li class="d-f">
            <div class="item-label">{{ $t('common.status') }}</div>
            <div class="item-text status">
              <el-progress :text-inside="true" :stroke-width="20" :percentage="100" status="success"></el-progress>
            </div>
          </li>
          <li class="d-f">
            <div class="item-label">{{ $t('depot.debug') }}</div>
            <div class="item-text pos-r">
              <img class="pos-a" src="../../assets/images/airport/a_maintain.svg"/>
              <el-button class="font-16" @click.prevent="doMsission('pickbbattery')" type="danger">{{ $t('depot.putin') }}</el-button>
              <el-button class="font-16" @click.prevent="doMsission('mountbbattery')" type="danger">{{ $t('depot.pickout') }}</el-button>
            </div>
          </li>
          <li class="d-f">
            <div class="item-label">{{ $t('depot.debug') }}</div>
            <div class="item-text debug pos-r">
              <img class="pos-a" src="../../assets/images/airport/a_charging.svg"/>
              <el-button class="font-16" @click.prevent="doMsission('power_chargedrone_on')" type="warning">{{ $t('depot.start_charge') }}</el-button>
              <el-button class="font-16" @click.prevent="doMsission('power_chargedrone_off')" type="warning">{{ $t('depot.stop_charge') }}</el-button>
            </div>
          </li>
        </el-col>
      </el-col>
    </el-row>
  </section>
</template>

<script>
  import mqttClient from '../../config/mqtt';
  export default {
    name: "Battery",
    props: {
      node:{
        type:Object,
        required: true,
        default: () => {}
      }
    },
    methods: {
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
  .battery {
    border-bottom: 1px solid #e4eaef;
  }
  .battery .bat-box {padding: 20px 0;}
  .battery .infos {padding: 16px 0;}
  .battery .bat-left {border-right: 1px solid #e4eaef;}
  .battery .bat-box img{
    width: 75px;
    height: 75px;
    margin-bottom: 10px;
  }
  .battery .item-label {width: 80px;}
  .battery .item-text {min-height: 30px;}
  .battery .item-text span:last-child {padding-left: 5px;}
  .battery .item-text img {
    left: 5px;
    top: 50%;
    width: 40px;
    height: 40px;
    -webkit-transform: translateY(-50%);
    -moz-transform: translateY(-50%);
    -ms-transform: translateY(-50%);
    -o-transform: translateY(-50%);
    transform: translateY(-50%);
  }
  .battery .item-text.pos-r {
    height: 45px;
    padding-left: 64px;
  }
  .battery .item-text.debug {margin-top: 20px;}
  .battery .item-text.debug:before {
    content: '';
    position: absolute;
    top: -10px;
    left: 0;
    right: 0;
    height: 1px;
    background-color: #e4eaef;
  }
  .battery .item-text.status {
    width: 290px;
    height: 20px;
  }
</style>
