<template>
  <el-dialog
    custom-class="sd-preflight"
    :title="$t('preflight.title')"
    :visible.sync="show"
    :close-on-click-modal="false"
    @open="check"
    @closed="reset"
  >
    <div>
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
          <div>{{ $t('preflight.distance') }} {{ preflightData.forecast.precipitation_distance }} km</div>
        </div>
        <i class="sd-preflight__icon" :class="LevelClass[preflightData.forecast.level]"></i>
      </div>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button size="medium" icon="el-icon-circle-close" @click="toggle">{{ $t('common.cancel') }}</el-button>
      <sd-slide-confirm
        size="medium"
        ref="slide"
        :disabled="disabled"
        :text="$t('preflight.slide2confirm')"
        @confirm="emitRun"
      ></sd-slide-confirm>
    </div>
  </el-dialog>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

import Icon from '@/components/sd-icon.vue';
import SlideConfirm from '@/components/slide-confirm.vue';
import { checkForecast, windSpeedLevel } from '@/api/plan-runnable';

const StatusClass = {
  0: 'el-icon-success sd-preflight-green',
  1: 'el-icon-info sd-preflight-grey',
  2: 'el-icon-error sd-preflight-red',
  3: 'el-icon-error sd-preflight-grey'
};

const LevelClass = {
  success: 'el-icon-success sd-preflight-green',
  primary: 'el-icon-circle-plus sd-preflight-blue',
  warning: 'el-icon-warning sd-preflight-orange',
  danger: 'el-icon-remove sd-preflight-red',
  error: 'el-icon-error sd-preflight-grey'
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
      preflightData: DefaultPreflightData
    };
  },
  computed: {
    StatusClass() {
      return StatusClass;
    },
    LevelClass() {
      return LevelClass;
    },
    ...mapGetters([
      'drones',
      'depots'
    ]),
    defaultDrone() {
      return { info: { name: this.$t('preflight.no_drone') }, status: 3 };
    },
    drone() {
      return this.drones.find(d => d.info.id === this.plan.node_id) || this.defaultDrone;
    },
    defaultDepot() {
      return {
        info: {
          name: this.$t('preflight.no_depot'),
          points: [{ point_type_name: 'weather' }]
        },
        status: 3,
      };
    },
    depot() {
      return this.depots.find(d => d.msg.status && d.msg.status.link_id === this.plan.node_id) || this.defaultDepot;
    },
    weatherPoint() {
      return this.depot.info.points.find(p => p.point_type_name === 'weather');
    },
    canRunPlan() {
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
    disabled() {
      return this.loading.some(value => value === true) || !this.canRunPlan;
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
      const timeout = (1 + Math.random()) * 1000;
      return new Promise(resolve => setTimeout(resolve, timeout));
    },
    async checkDrone() {
      // nothing to check though
    },
    async checkDepot() {
      const { id } = this.depot.info;
      if (!id) return;
      await this.updateDepotStatus(id);
    },
    async checkRealtime(time) {
      if (!this.weatherPoint) return;
      this.preflightData.realtime = DefaultPreflightData.realtime;
      /** @type {import('@/store/modules/node').WeatherRecord} */
      const records = this.depot.weatherRec;
      const avgSpeed = records.reduce((a, b) => a + b.weather.WS, 0) / records.length;
      const result = windSpeedLevel(avgSpeed);
      if (time === this.checkTime) {
        this.preflightData.realtime = result;
      }
    },
    async checkForecast(time) {
      const { position } = this.depot;
      if (!position) return;
      this.preflightData.forecast = DefaultPreflightData.forecast;
      const result = await checkForecast(position);
      if (time === this.checkTime) {
        this.preflightData.forecast = result;
      }
    },
    async check() {
      const t = Date.now();
      const start = prom => Promise.all([this.wait(), prom]);
      const finish = index => this.checkTime === t && this.$set(this.loading, index, false);
      this.checkTime = t;
      this.loading = Array(4).fill(true);
      await start(this.checkDrone());
      finish(0);
      await start(this.checkDepot());
      finish(1);
      await start(this.checkRealtime(t));
      finish(2);
      await start(this.checkForecast(t));
      finish(3);
    },
    emitRun() {
      setTimeout(() => this.$emit('run'), 750);
    },
    reset() {
      this.$refs.slide.deactivate();
      this.preflightData = DefaultPreflightData;
    }
  },
  components: {
    [Icon.name]: Icon,
    [SlideConfirm.name]: SlideConfirm
  }
};
</script>

<style>
.sd-preflight {
  width: 500px;
}
.sd-preflight .el-dialog__body {
  padding: 10px 20px;
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
