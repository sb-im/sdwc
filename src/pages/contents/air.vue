<template>
  <section class="wrapper">
    <section class="head font-14">
      <uav-status :status="uavStatus"></uav-status>
      <el-row class="map-video">
        <el-col class="left">
          <rt-moniter :video="node.points[0]"></rt-moniter>
        </el-col>
        <el-col class="right">
          <div class="maps">
            <uactrack :flight="uavFlight"></uactrack>
          </div>
          <div class="pitch">
            <div class="pitch-slider d-f">
              <p class="label font-16">{{ $t('air.pitch_angle') }}</p><el-slider class="slider"></el-slider>
            </div>
            <div class="btns">
              <el-button type="primary" class="font-16">{{ $t('air.screenshot') }}</el-button>
              <el-button type="primary" class="font-16">{{ $t('air.recording') }}</el-button>
            </div>
          </div>
        </el-col>
      </el-row>
    </section>
    <terminal :node="node"></terminal>
  </section>
</template>

<script>
  import monitor from '../../components/rt-monitor/rt-monitor.vue'
  import uavStatus from '../../components/uavstatus.vue'
  import terminal from '../../components/air_terminal/base'
  import uactrack from '../../components/uavtrack'
  export default {
    data() {
      return {
        activeIndex:'1',
        tableTest:[{
          id:'A007'
        }]
      }
    },
    props: {
      node: {
        type: Object,
        required: true,
        default: () => {}
      }
    },
    components: {
      'rt-moniter': monitor,
      'uav-status': uavStatus,
      'terminal': terminal,
      'uactrack': uactrack,
    },
    computed: {
      message() {
        const nm = this.$store.state.nodeMessage.find(msg => msg.id == this.node.id) || {message: []};
        return nm.message;
      },
      uavFlight() {
        return this.message.map(msg => {
          const {status: {gps: {lat, lon}}} = JSON.parse(msg);
          return {lat, lng: lon};
        })
      },
      uavStatus() {
        const {status} = JSON.parse(this.message[this.message.length - 1] || '{}');
        return status;
      }
    },
    methods: {

    }
  }
</script>

<style scoped>
  .head {border-bottom: 1px solid #e4eaef;}
  .map-video .left {
    width: 750px;
    height: 460px;
    background-color: #000;
    border-right: 1px solid #e4eaef;
  }
  .map-video .left > *{
    width: 100%;
    height: 100%;
  }
  .map-video .right {width: calc(100% - 750px);}
  .map-video .maps {
    width: 100%;
    height: 310px;
    background-color: #eee;
  }
  .map-video .pitch {padding: 10px 28px;}
  .map-video .pitch-slider .label {
    height: 40px;
    line-height: 40px;
    width: 36%;
  }
  .map-video .pitch-slider .slider {width: 64%;}
  .map-video .right .btns{margin-top: 8px;}
  .map-video .right .btns button{width: 125px;}
</style>
