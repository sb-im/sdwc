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
      <sd-preflight-item icon="drone" title="common.air" :loading="loading[0]" :status="droneStatus" :node="drone">
        <div v-if="droneBattery.show" :class="droneBattery.class" v-t="{ path: 'preflight.battery', args: drone.msg.battery }"></div>
      </sd-preflight-item>
      <sd-preflight-item icon="depot" title="common.depot" :loading="loading[1]" :status="depotStatus" :node="depot"></sd-preflight-item>
      <sd-preflight-item icon="barometer" title="preflight.realtime" :loading="loading[2]" :level="weather.level">
        <div v-t="{ path: 'preflight.wind', args: { n: weather.wind.speed.toFixed(1) } }"></div>
        <div v-t="{ path: 'preflight.intensity', args: { n: weather.rain.intensity } }"></div>
        <div v-t="weather.rain.distance >= 10000 ? 'preflight.no_precipitation' : { path: 'preflight.distance', args: { n: weather.rain.distance } }"></div>
      </sd-preflight-item>
    </template>
    <template v-else>
      <div class="sd-preflight__plan">
        <div :class="PlanStatusClass[run.status]" class="sd-preflight__plan-status"></div>
        <div class="sd-preflight__plan-text">
          <div v-if="run.status === 0" v-t="'preflight.started'"></div>
          <div v-else-if="run.status === 1" v-t="{ path: 'preflight.failed', args: { code: run.code } }"></div>
          <div v-else-if="run.status === 2" v-t="'preflight.starting'"></div>
        </div>
      </div>
    </template>
    <template slot="footer">
      <el-button size="medium" icon="el-icon-circle-close" @click="toggle" v-t="'common.cancel'"></el-button>
      <template v-if="!activated">
        <sd-slide-confirm size="medium" ref="slide" :type="droneBattery.level" :disabled="slideDisabled" @confirm="handleConfirm" text="preflight.slide2confirm"></sd-slide-confirm>
      </template>
      <template v-else>
        <el-button-group>
          <el-button size="medium" @click="toDrone" v-t="'preflight.drone'"></el-button>
          <sd-countdown-button size="medium" mode="timeout" ref="btnToDepot" @click="toDepot" text="preflight.depot"></sd-countdown-button>
        </el-button-group>
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

const DefaultWeatherResult = {
  level: 'error',
  wind: {
    speed: 0
  },
  rain: {
    distance: 0,
    intensity: 0
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
      activated: false,
      checkTime: 0,
      loading: [false, false, false],
      precheck: {
        drone: null,
        depot: null
      },
      weather: DefaultWeatherResult,
      run: {
        status: -1,
        code: -1
      },
    };
  },
  computed: {
    ...mapGetters([
      'drones',
      'depots'
    ]),
    drone() {
      return this.drones.find(d => d.info.id === this.plan.node_id)
        || { info: { name: this.$t('preflight.no_drone'), points: [] }, status: { code: -2 } };
    },
    depot() {
      return this.depots.find(d => d.status.status.link_id === this.plan.node_id)
        || { info: { name: this.$t('preflight.no_depot'), points: [] }, status: { code: -2 }, };
    },
    droneStatus() {
      return this.precheck.drone === null ? this.drone.status.code : this.precheck.drone;
    },
    depotStatus() {
      return this.precheck.depot === null ? this.depot.status.code : this.precheck.depot;
    },
    droneBattery() {
      const { info: { points }, msg } = this.drone;
      if (!msg || points.findIndex(p => p.point_type_name === 'battery') < 0) return { show: false };
      const level = msg.battery.remain <= 50 ? 'danger' : msg.battery.remain <= 70 ? 'warning' : '';
      return {
        level,
        show: true,
        class: `sd-preflight__subitem--${level}`
      };
    },
    checkPassed() {
      return (
        // drone status ok / poweroff
        this.droneStatus === 0
        // depot status ok
        && this.depotStatus === 0
        // caiyun weather forecast ok
        && this.weather.level !== 'error'
      );
    },
    slideDisabled() {
      return (
        // checking
        this.loading.some(value => value === true)
        // check failed
        || !this.checkPassed
      );
    },
  },
  methods: {
    ...mapActions([
      'updateDepotStatus'
    ]),
    toggle() {
      this.show = !this.show;
    },
    sendBoth(mission) {
      const p = [];
      if (this.drone.status.code === 0) {
        p.push(this.$mqtt(this.drone.info.id, { mission }));
      }
      if (this.depot.status.code === 0) {
        p.push(this.$mqtt(this.depot.info.id, { mission }));
      }
      return Promise.all(p).catch(() => { /* avoid unhandled promise rejevtion */ });
    },
    async checkDrone() {
      const { info: { id } } = this.drone;
      try {
        await this.$mqtt(id, { mission: 'precheck' });
      } catch (e) {
        this.precheck.drone = -3;
      }
    },
    async checkDepot() {
      const { info: { id }, status: { legacy } } = this.depot;
      if (id && legacy) {
        await this.updateDepotStatus(id);
      }
      try {
        await this.$mqtt(id, { mission: 'precheck' });
      } catch (e) {
        this.precheck.depot = -3;
      }
    },
    async checkWeather(timestamp) {
      this.weather = DefaultWeatherResult;
      const { info: { id }, status: { status } } = this.depot;
      if (!status) return;
      let averageWindSpeed;
      if (this.depot.info.points.findIndex(p => p.point_type_name === 'weather') >= 0) {
        // calculate average wind speed from history data
        try {
          /** @type {Record<string, SDWC.NodeWeather>} */
          const history = await this.$mqtt(id, {
            mission: 'history',
            arg: { topic: 'msg/weather', time: '1m' }
          });
          const keys = Object.getOwnPropertyNames(history);
          if (typeof history === 'object' && keys.length >0 && keys.every(n => n.match(/^\d+$/))) {
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
        this.weather = result;
      }
    },
    check() {
      const t = Date.now();
      this.checkTime = t;
      const queue = [];
      const wrap = (p, i) => {
        this.$set(this.loading, i, true);
        queue.push(p.then(() => this.checkTime === t && this.$set(this.loading, i, false)));
      };
      wrap(this.checkWeather(t), 2);
      if (this.depot.status.code !== 0) return;
      wrap(this.checkDepot(), 1);
      if (this.drone.status.code === 0) {
        wrap(this.checkDrone(), 0);
      } else if (this.drone.status.code !== -2) {
        const p = new Promise(resolve => {
          const unwatch = this.$store.watch(
            state => state.node.find(n => n.info.id === this.drone.info.id).status.code,
            (val, oldVal) => {
              if (val === 0 && oldVal !== 0) {
                unwatch();
                delete this._unwatch;
                resolve(this.checkDrone());
              }
            }
          );
          this._unwatch = unwatch;
        });
        wrap(p, 0);
      }
    },
    handleConfirm() {
      this.activated = true;
      this.run.status = 2;
      this.$emit('run');
    },
    setPlanRunStatus(status, code = 0) {
      this.run = { status, code };
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
        this.run = { status: -1, code: -1 };
      } else {
        this.$refs.slide.deactivate();
        if (this.run.status === -1) {
          this.sendBoth('postcheck_cancel');
        }
      }
      this.precheck = { drone: null, depot: null };
      this.weather = DefaultWeatherResult;
      if (typeof this._unwatch === 'function') {
        this._unwatch();
        delete this._unwatch;
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
.sd-preflight .el-dialog__footer {
  display: flex;
  justify-content: space-between;
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
