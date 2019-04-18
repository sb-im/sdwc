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
          <div class="angle">
            <div class="sliders">
              <div>
                <span>{{ $t('air.pitch_angle') }}</span>
                <el-slider
                  v-model="gimbal.yaw"
                  :max="90"
                  :min="-90"
                  :disabled="gimbalDisabled"
                  @change="doGimbalCtl('yaw', $event)"
                  style="width:225px;margin:8px 0;" />
                <el-radio-group v-model="gimbalMode" @change="doGimbalMode">
                  <el-radio-button label="mavlink">{{ $t('air.gimbal_mode_mavlink') }}</el-radio-button>
                  <el-radio-button label="neutral">{{ $t('air.gimbal_mode_neutral') }}</el-radio-button>
                  <el-radio-button label="rc">{{ $t('air.gimbal_mode_rc') }}</el-radio-button>
                </el-radio-group>
              </div>
              <el-slider
                vertical
                v-model="gimbal.pitch"
                :max="45"
                :min="-90"
                :disabled="gimbalDisabled"
                @change="doGimbalCtl('pitch', $event)"
                height="108px" />
            </div>
          </div>
        </el-col>
      </el-row>
    </section>
    <terminal :node="node" ref="term"></terminal>
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
        gimbalMode: '',
        gimbal: {
          yaw: 0,
          pitch: 0
        }
      }
    },
    props: {
      node: {
        type: Object,
        required: true
      }
    },
    components: {
      'rt-moniter': monitor,
      'uav-status': uavStatus,
      'terminal': terminal,
      'uactrack': uactrack,
    },
    computed: {
      gimbalDisabled() {
        const { status } = this.$store.state.nodeStatus.find(st => st.id == this.node.id);
        return status != 0 || this.gimbalMode !== 'mavlink';
      },
      message() {
        const nm = this.$store.state.nodeMessage.find(msg => msg.id == this.node.id) || {message: []};
        return nm.message;
      },
      uavFlight() {
        return this.message.map(msg => {
          const {status: {gps: {lat, lon}}} = msg;
          return {lat, lng: lon};
        });
      },
      uavStatus() {
        const {status} = this.message[this.message.length - 1] || {};
        return status;
      }
    },
    methods: {
      doGimbalMode(mode) {
        this.gimbalMode = '';
        this.$refs.term.doMsission(this.$t('air.gimbal_mode_' + mode), 'gimbalmode', [mode])
          .then(err =>  {
            if (!err) {
              this.gimbalMode = mode;
            }
          })
          .catch(() => {/* noop */});
      },
      doGimbalCtl(prop, value) {
        let argument = Object.assign({}, this.gimbal);
        argument[prop] = value;
        this.$refs.term.doMsission(this.$t('air.pitch_angle'), 'gimbal', argument);
      }
    },
    watch: {
      uavStatus(value) {
        if (value.mount) {
          this.gimbal.yaw = value.mount.yaw;
          this.gimbal.pitch = value.mount.pitch;
        }
      }
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
  .angle,
  .angle .sliders {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .angle {
    height: 150px;
  }
</style>
