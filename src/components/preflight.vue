<template>
  <el-dialog
    custom-class="sd-preflight"
    :title="$t('preflight.title')"
    :visible.sync="show"
    :close-on-click-modal="false"
    @open="check"
    @closed="reset"
  >
    <template v-if="!activated">
      <div class="sd-preflight__item" v-loading="loading[0]">
        <sd-icon value="drone" :size="30"></sd-icon>
        <div class="sd-preflight__detail sd-preflight__title">{{ drone.info.name }}</div>
        <i class="sd-preflight__icon" :class="StatusClass[drone.status]"></i>
      </div>
      <div class="sd-preflight__item" v-loading="loading[1]">
        <sd-icon value="depot" :size="30"></sd-icon>
        <div class="sd-preflight__detail sd-preflight__title">{{ depot.info.name }}</div>
        <i class="sd-preflight__icon" :class="StatusClass[depot.status]"></i>
      </div>
      <div v-if="weatherPoint" class="sd-preflight__item" v-loading="loading[2]">
        <sd-icon value="barometer" :size="30"></sd-icon>
        <div class="sd-preflight__detail">
          <div class="sd-preflight__title">{{ $t('preflight.realtime') }}</div>
          <div>{{ $t('preflight.wind') }} {{ preflightData.realtime.wind_speed }} m/s</div>
        </div>
        <i class="sd-preflight__icon" :class="LevelClass[preflightData.realtime.level]"></i>
      </div>
      <div class="sd-preflight__item" v-loading="loading[3]">
        <sd-icon value="satellite" :size="30"></sd-icon>
        <div class="sd-preflight__detail">
          <div class="sd-preflight__title">{{ $t('preflight.forecast') }}</div>
          <div>{{ $t('preflight.wind') }} {{ preflightData.forecast.wind_speed.toFixed(1) }} m/s</div>
          <div>{{ $t('preflight.intensity') }} {{ preflightData.forecast.precipitation_intensity }}</div>
          <template v-if="preflightData.forecast.precipitation_distance >= 10000">
            <div>{{ $t('preflight.no_precipitation') }}</div>
          </template>
          <template v-else>
            <div>{{ $t('preflight.distance') }} {{ preflightData.forecast.precipitation_distance }} km</div>
          </template>
        </div>
        <i class="sd-preflight__icon" :class="LevelClass[preflightData.forecast.level]"></i>
      </div>
    </template>
    <template v-else>
      <div class="sd-preflight__plan">
        <div :class="PlanStatusClass[runStatus]" class="sd-preflight__plan-status"></div>
        <div class="sd-preflight__plan-text">{{ planStatusText }}</div>
      </div>
    </template>
    <template slot="footer">
      <el-button size="medium" icon="el-icon-circle-close" @click="toggle">{{ $t('common.cancel') }}</el-button>
      <template v-if="!activated">
        <sd-slide-confirm
          size="medium"
          ref="slide"
          :disabled="slideDisabled"
          :text="$t('preflight.slide2confirm')"
          @confirm="emitRun"
        ></sd-slide-confirm>
      </template>
      <template v-else>
        <el-button size="medium" @click="toDrone">{{ $t('common.air') }}</el-button>
        <sd-countdown-button
          size="medium"
          mode="timeout"
          ref="btnToDepot"
          @click="toDepot"
        >{{ $t('common.depot') }}</sd-countdown-button>
      </template>
    </template>
  </el-dialog>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

import Icon from '@/components/sd-icon.vue';
import SlideConfirm from '@/components/slide-confirm.vue';
import CountdownButton from '@/components/countdown-button.vue';
import { checkForecast, windSpeedLevel } from '@/api/plan-runnable';

// drone/depot status
const StatusClass = {
  0: 'el-icon-success sd-preflight-green',
  1: 'el-icon-info sd-preflight-grey',
  2: 'el-icon-error sd-preflight-red',
  3: 'el-icon-error sd-preflight-grey'
};

// realtime/forecast weather level
const LevelClass = {
  success: 'el-icon-success sd-preflight-green',
  primary: 'el-icon-circle-plus sd-preflight-blue',
  warning: 'el-icon-warning sd-preflight-orange',
  danger: 'el-icon-remove sd-preflight-red',
  error: 'el-icon-error sd-preflight-grey'
};

// plan run status
const PlanStatusClass = {
  0: 'el-icon-success sd-preflight-green',
  1: 'el-icon-error sd-preflight-red',
  2: 'el-icon-loading sd-preflight-grey'
};

const DefaultPreflightData = {
  realtime: {
    wind_speed: 0,
    level: 'error'
  },
  forecast: {
    precipitation_intensity: 0,
    precipitation_distance: 0,
    wind_speed: 0,
    level: 'error'
  }
};

export default {
  name: 'sd-preflight',
  props: {
    plan: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      show: false,
      checkTime: 0,
      loading: Array(4).fill(false),
      preflightData: DefaultPreflightData,
      activated: false,
      runStatus: 2,
      returnCode: 0
    };
  },
  computed: {
    ...mapGetters([
      'drones',
      'depots'
    ]),
    drone() {
      return this.drones.find(d => d.info.id === this.plan.node_id)
        || { info: { name: this.$t('preflight.no_drone') }, status: 3 };
    },
    depot() {
      return this.depots.find(d => d.msg.status && d.msg.status.link_id === this.plan.node_id)
        || { info: { name: this.$t('preflight.no_depot'), points: [] }, status: 3, };
    },
    weatherPoint() {
      return this.depot.info.points.find(p => p.point_type_name === 'weather');
    },
    checkPassed() {
      return (
        // drone status ok / poweroff
        (this.drone.status === 0 || this.drone.status === 1)
        // depot status ok
        && this.depot.status === 0
        // have realtime weather && weather ok
        && (!this.weatherPoint.name || this.preflightData.realtime.level !== 'error')
        // caiyun weather forecast ok
        && this.preflightData.forecast.level !== 'error'
      );
    },
    slideDisabled() {
      return (
        // checking
        this.loading.some(value => value === true)
        // check failed
        || !this.checkPassed
        // drone poweroff
        || this.drone.status === 1
      );
    },
    planStatusText() {
      if (!this.activated) return '';
      switch (this.runStatus) {
        case 0: return this.$t('plan.view.start_run');
        case 1: return this.$t('plan.view.start_fail', { code: this.returnCode });
        case 2: return this.$t('plan.view.pending');
        default: return '';
      }
    }
  },
  methods: {
    ...mapActions([
      'updateDepotStatus'
    ]),
    toggle() {
      this.show = !this.show;
    },
    wait() {
      const timeout = (1.5 + Math.random()) * 1000;
      return new Promise(resolve => setTimeout(resolve, timeout));
    },
    async preCheck() {
      this.$mqtt(this.depot.info.id, { mission: 'power_chargedrone_on' });
    },
    async checkDrone() {
      // nothing to check though
    },
    async checkDepot() {
      const { id } = this.depot.info;
      if (!id) return;
      await this.updateDepotStatus(id);
    },
    async checkRealtime(timestamp) {
      if (!this.weatherPoint) return;
      this.preflightData.realtime = DefaultPreflightData.realtime;
      /** @type {SDWC.WeatherRecord[]} */
      const records = this.depot.weatherRec;
      const avgSpeed = records.reduce((a, b) => a + b.weather.WS, 0) / records.length;
      const result = windSpeedLevel(avgSpeed);
      if (timestamp === this.checkTime) {
        this.preflightData.realtime = result;
      }
    },
    async checkForecast(timestamp) {
      const { position } = this.depot;
      if (!position) return;
      this.preflightData.forecast = DefaultPreflightData.forecast;
      const result = await checkForecast(position);
      if (timestamp === this.checkTime) {
        this.preflightData.forecast = result;
      }
    },
    async check() {
      const t = Date.now();
      const wrap = async (prom, index) => {
        await Promise.all([this.wait(), prom]);
        if (this.checkTime === t) {
          this.$set(this.loading, index, false);
        }
      };
      this.preCheck();
      this.checkTime = t;
      this.loading = Array(4).fill(true);
      await Promise.all([
        wrap(this.checkDrone(), 0),
        wrap(this.checkDepot(), 1),
        wrap(this.checkRealtime(t), 2),
        wrap(this.checkForecast(t), 3)
      ]);
    },
    emitRun() {
      this.activated = true;
      this.$emit('run');
    },
    setPlanRunStatus(status, code = 0) {
      this.runStatus = status;
      this.returnCode = code;
      if (status === 0) {
        this.$refs.btnToDepot.countDown();
      }
    },
    toDrone() {
      this.$router.push({ name: 'node', params: { id: this.drone.info.id } });
    },
    toDepot() {
      this.$router.push({ name: 'node', params: { id: this.depot.info.id } });
    },
    reset() {
      if (this.activated) {
        this.activated = false;
        this.runStatus = -1;
      } else {
        this.$refs.slide.deactivate();
      }
      this.preflightData = DefaultPreflightData;
    }
  },
  created() {
    this.StatusClass = StatusClass;
    this.LevelClass = LevelClass;
    this.PlanStatusClass = PlanStatusClass;
  },
  components: {
    [Icon.name]: Icon,
    [SlideConfirm.name]: SlideConfirm,
    [CountdownButton.name]: CountdownButton
  }
};
</script>

<style>
.sd-preflight {
  width: 500px;
}
.sd-preflight .el-dialog__body {
  padding: 10px 20px;
  height: 260px;
}
.sd-preflight__item {
  margin: 10px 0;
  display: flex;
}
.sd-preflight__detail {
  flex-grow: 1;
  padding: 0 8px;
}
.sd-preflight__title {
  font-size: 18px;
  line-height: 30px;
  font-weight: bold;
}
.sd-preflight__icon {
  line-height: 30px;
  font-size: 24px;
}
.sd-preflight__plan {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-evenly;
}
.sd-preflight__plan-status {
  font-size: 60px;
}
.sd-preflight-green {
  color: #67c23a;
}
.sd-preflight-blue {
  color: #409eff;
}
.sd-preflight-orange {
  color: #e6a23c;
}
.sd-preflight-red {
  color: #f56c6c;
}
.sd-preflight-grey {
  color: #606266;
}
</style>
