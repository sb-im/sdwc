<template>
  <el-dialog
    custom-class="sd-preflight"
    :visible.sync="show"
    :close-on-click-modal="false"
    @open="check"
    @closed="reset"
  >
    <span slot="title" class="el-dialog__title" v-t="'preflight.title'"></span>
    <template v-if="!activated">
      <div class="sd-preflight__item" v-loading="loading[0]">
        <sd-icon value="drone" :size="30"></sd-icon>
        <div class="sd-preflight__detail sd-preflight__title">{{ drone.info.name }}</div>
        <i class="sd-preflight__icon" :class="StatusClass[drone.status.code]"></i>
      </div>
      <div class="sd-preflight__item" v-loading="loading[1]">
        <sd-icon value="depot" :size="30"></sd-icon>
        <div class="sd-preflight__detail sd-preflight__title">{{ depot.info.name }}</div>
        <i class="sd-preflight__icon" :class="StatusClass[depot.status.code]"></i>
      </div>
      <div class="sd-preflight__item" v-loading="loading[2]">
        <sd-icon value="barometer" :size="30"></sd-icon>
        <div class="sd-preflight__detail">
          <div class="sd-preflight__title" v-t="'preflight.realtime'"></div>
          <div v-t="{ path: 'preflight.wind', args: { n: preflightData.forecast.wind_speed.toFixed(1) } }" ></div>
          <div v-t="{ path: 'preflight.intensity', args: { n: preflightData.forecast.precipitation_intensity } }"></div>
          <div v-t="preflightData.forecast.precipitation_distance >= 10000 ? 'preflight.no_precipitation' : { path: 'preflight.distance', args: { n: preflightData.forecast.precipitation_distance } }"></div>
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
      <el-button size="medium" icon="el-icon-circle-close" @click="toggle" v-t="'common.cancel'"></el-button>
      <template v-if="!activated">
        <sd-slide-confirm
          size="medium"
          ref="slide"
          :disabled="slideDisabled"
          @confirm="emitRun"
          text="preflight.slide2confirm"
        ></sd-slide-confirm>
      </template>
      <template v-else>
        <el-button size="medium" @click="toDrone" v-t="'preflight.drone'"></el-button>
        <sd-countdown-button
          size="medium"
          mode="timeout"
          ref="btnToDepot"
          @click="toDepot"
          text="preflight.depot"
        ></sd-countdown-button>
      </template>
    </template>
  </el-dialog>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

import { realtime } from '@/api/caiyun';
import { forecastLevel } from '@/api/plan-runnable';

import Icon from '@/components/sd-icon.vue';
import SlideConfirm from '@/components/slide-confirm.vue';
import CountdownButton from '@/components/countdown-button.vue';

// drone/depot status
const StatusClass = {
  0: 'el-icon-success color--green',
  1: 'el-icon-info color--grey',
  2: 'el-icon-error color--red',
  3: 'el-icon-error color--grey'
};

// realtime/forecast weather level
const LevelClass = {
  success: 'el-icon-success color--green',
  primary: 'el-icon-circle-plus color--blue',
  warning: 'el-icon-warning color--orange',
  danger: 'el-icon-remove color--red',
  error: 'el-icon-error color--grey'
};

// plan run status
const PlanStatusClass = {
  0: 'el-icon-success color--green',
  1: 'el-icon-error color--red',
  2: 'el-icon-loading color--grey'
};

const DefaultPreflightData = {
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
        || { info: { name: this.$t('preflight.no_drone') }, status: { code: 3 } };
    },
    depot() {
      return this.depots.find(d => d.status.status.link_id === this.plan.node_id)
        || { info: { name: this.$t('preflight.no_depot'), points: [] }, status: { code: 3 }, };
    },
    weatherPoint() {
      return this.depot.info.points.find(p => p.point_type_name === 'weather');
    },
    checkPassed() {
      return (
        // drone status ok / poweroff
        (this.drone.status.code === 0 || this.drone.status.code === 1)
        // depot status ok
        && this.depot.status.code === 0
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
        || this.drone.status.code === 1
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
    preCheck() {
      if (this.depot.status.code === 3) {
        // no depot; skip pre-check
        return;
      }
      return this.$mqtt(this.depot.info.id, { mission: 'power_chargedrone_on' });
    },
    async checkDrone() {
      // nothing to check though
    },
    async checkDepot() {
      const { info: { id }, status: { legacy } } = this.depot;
      if (!id || !legacy) return;
      await this.updateDepotStatus(id);
    },
    async checkWeather(timestamp) {
      this.preflightData.forecast = DefaultPreflightData.forecast;
      const { status } = this.depot.status;
      if (!status) return;
      let averageWindSpeed;
      if (this.weatherPoint) {
        // calculate average wind speed from history data
        try {
          /** @type {Record<string, SDWC.NodeWeather>} */
          const history = await this.$mqtt(this.depot.info.id, {
            mission: 'history',
            arg: { topic: 'msg/weather', time: '1m' }
          });
          let sum = 0;
          let duration = 0;
          let time = Math.trunc(timestamp / 1000);
          for (let [t, data] of Object.entries(history).sort((a, b) => b[0] - a[0])) {
            let span = time - Number.parseInt(t);
            sum += span * data.WS;
            duration += span;
            time = t;
          }
          averageWindSpeed = sum / duration;
        } catch (e) { /* noop */ }
      }
      const r = await realtime(status.lng, status.lat);
      if (typeof averageWindSpeed === 'number') {
        r.result.wind.speed = averageWindSpeed;
      }
      const result = await forecastLevel(r);
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
      this.checkTime = t;
      this.loading = Array(3).fill(true);
      await this.preCheck();
      await Promise.all([
        wrap(this.checkDrone(), 0),
        wrap(this.checkDepot(), 1),
        wrap(this.checkWeather(t), 2)
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
  box-sizing: content-box;
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
</style>
