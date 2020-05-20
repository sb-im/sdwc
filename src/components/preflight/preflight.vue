<template>
  <el-dialog
    custom-class="sd-preflight"
    append-to-body
    :visible.sync="show"
    :close-on-click-modal="false"
    @open="check"
    @closed="reset"
  >
    <span slot="title" class="el-dialog__title" v-t="'preflight.title'"></span>
    <template v-if="!activated">
      <sd-preflight-item
        icon="drone"
        title="common.air"
        :loading="loading[0]"
        :status="drone.status.code"
        :node="drone"
      ></sd-preflight-item>
      <sd-preflight-item
        icon="depot"
        title="common.depot"
        :loading="loading[1]"
        :status="depot.status.code"
        :node="depot"
      ></sd-preflight-item>
      <sd-preflight-item
        icon="barometer"
        title="preflight.realtime"
        :loading="loading[2]"
        :level="preflightData.forecast.level"
      >
        <div v-t="{ path: 'preflight.wind', args: { n: preflightData.forecast.wind_speed.toFixed(1) } }"></div>
        <div v-t="{ path: 'preflight.intensity', args: { n: preflightData.forecast.precipitation_intensity } }"></div>
        <div v-t="preflightData.forecast.precipitation_distance >= 10000 ? 'preflight.no_precipitation' : { path: 'preflight.distance', args: { n: preflightData.forecast.precipitation_distance } }"></div>
      </sd-preflight-item>
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
        <sd-countdown-button size="medium" mode="timeout" ref="btnToDepot" @click="toDepot" text="preflight.depot"></sd-countdown-button>
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

import PreflightItem from './preflight-item.vue';

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
      loading: [],
      preflightData: DefaultPreflightData,
      activated: false,
      runStatus: -1,
      returnCode: -1
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
      const timeout = Math.random() * 1000;
      return new Promise(resolve => setTimeout(resolve, timeout));
    },
    sendBoth(mission) {
      const p = [];
      if (this.drone.status.code !== 3) {
        p.push(this.$mqtt(this.drone.info.id, { mission }));
      }
      if (this.depot.status.code !== 3) {
        p.push(this.$mqtt(this.depot.info.id, { mission }));
      }
      return Promise.all(p);
    },
    async checkDrone() {
      if (this.depot.status.code !== 0) return;
      const { info: { id }, status: { code } } = this.drone;
      if (code === 0) {
        return this.$mqtt(id, { mission: 'precheck' });
      } else if (code !== 3) {
        return new Promise((resolve, reject) => {
          const unwatch = this.$store.watch(state => state.node.find(n => n.info.id === id).status.code, (val, oldVal) => {
            if (val === 0 && oldVal !== 0) {
              unwatch();
              delete this._unwatch;
              this.$mqtt(id, { mission: 'precheck' }).then(resolve).catch(reject);
            }
          });
          this._unwatch = unwatch;
        });
      }
    },
    async checkDepot() {
      const { info: { id }, status: { code, legacy } } = this.depot;
      if (code !== 0) return;
      if (id && legacy) {
        await this.updateDepotStatus(id);
      }
      return this.$mqtt(id, { mission: 'precheck' });
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
          if (typeof history === 'object' && Object.getOwnPropertyNames(history).every(n => n.match(/^\d+$/))) {
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
          }
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
      await Promise.all([
        wrap(this.checkDrone(), 0),
        wrap(this.checkDepot(), 1),
        wrap(this.checkWeather(t), 2)
      ]);
    },
    emitRun() {
      this.activated = true;
      this.runStatus = 2;
      this.$emit('run');
    },
    setPlanRunStatus(status, code = 0) {
      this.runStatus = status;
      this.returnCode = code;
      if (status === 0) {
        this.$refs.btnToDepot.countDown();
        this.sendBoth('postcheck_execute');
      } else {
        this.sendBoth('postcheck_cancel');
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
        if (this.runStatus === -1) {
          this.sendBoth('postcheck_cancel');
        }
      }
      this.preflightData = DefaultPreflightData;
      if (typeof this._unwatch === 'function') {
        this._unwatch();
      }
    }
  },
  created() {
    this.PlanStatusClass = PlanStatusClass;
  },
  components: {
    [Icon.name]: Icon,
    [SlideConfirm.name]: SlideConfirm,
    [CountdownButton.name]: CountdownButton,
    [PreflightItem.name]: PreflightItem
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
