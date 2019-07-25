<template>
  <el-dialog custom-class="sd-preflight" :title="$t('preflight.title')" :visible.sync="show">
    <div v-loading="loading">
      <div class="sd-preflight__item">
        <sd-icon value="drone" :size="30"></sd-icon>
        <div class="sd-preflight__detail sd-preflight__title">{{ drone.info.name }}</div>
        <i class="sd-preflight__icon" :class="StatusClass[drone.status]"></i>
      </div>
      <div class="sd-preflight__item">
        <sd-icon value="depot" :size="30"></sd-icon>
        <div class="sd-preflight__detail sd-preflight__title">{{ depot.info.name }}</div>
        <i class="sd-preflight__icon" :class="StatusClass[depot.status]"></i>
      </div>
      <div class="sd-preflight__item">
        <sd-icon value="barometer" :size="30"></sd-icon>
        <div class="sd-preflight__detail">
          <div class="sd-preflight__title">{{ $t('preflight.realtime') }}</div>
          <div>{{ $t('preflight.wind') }} {{ preflightData.realtime.wind_speed }} m/s</div>
          <div>{{ $t('preflight.rain') }} {{ preflightData.realtime.rainfall_count }}</div>
        </div>
        <i class="sd-preflight__icon" :class="LevelClass[preflightData.realtime.level]"></i>
      </div>
      <div class="sd-preflight__item">
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
      <el-button
        type="danger"
        size="medium"
        icon="el-icon-refresh"
        :disabled="disabled"
        @click="emitRun"
      >{{ $t('preflight.comfirm') }}</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { mapGetters } from 'vuex';

import Icon from '@/components/sd-icon.vue';
import { planRunnable } from '@/api/plan-runnable';

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
    rainfall_count: 0,
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
      loading: false,
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
    weather() {
      return this.depot.info.points.find(p => p.point_type_name === 'weather');
    },
    disabled() {
      return this.loading ||
        this.drone.status !== 0 ||
        this.depot.status !== 0 ||
        this.preflightData.realtime.level === 'error' ||
        this.preflightData.forecast.level === 'error';
    }
  },
  methods: {
    toggle() {
      this.show = !this.show;
    },
    async check() {
      if (!this.weather.name || !this.depot.position) {
        this.preflightData = DefaultPreflightData;
        return;
      }
      this.loading = true;
      const id = this.weather.name;
      const { lng, lat } = this.depot.position;
      this.preflightData = await planRunnable({ lng, lat, id });
      this.loading = false;
    },
    emitRun() {
      this.$emit('run');
    }
  },
  watch: {
    show(val) {
      if (val === true) {
        this.check();
      } else {
        setTimeout(() => this.preflightData = DefaultPreflightData, 210);
      }
    }
  },
  components: {
    [Icon.name]: Icon
  }
};
</script>

<style>
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
