<template>
  <sd-card class="weather" icon="barometer" title="weather.title">
    <sd-weather-rain v-bind="precipitation"></sd-weather-rain>
    <sd-weather-wind :point="point" :status="status" :weather="msg.weather"></sd-weather-wind>
    <div class="weather__column weather__column--multi">
      <div class="weather__coord">
        <sd-weather-wind-icon :speed="msg.weather.WS" :direction="msg.weather.WD"></sd-weather-wind-icon>
      </div>
      <el-form label-width="70px" size="mini">
        <el-form-item>
          <span slot="label" v-t="'weather.wind.speed'"></span>
          <el-input readonly :value="msg.weather.WS">
            <template #append>m/s</template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <span slot="label" v-t="'weather.wind.direction'"></span>
          <el-input readonly :value="msg.weather.WD">
            <template #append>deg</template>
          </el-input>
        </el-form-item>
        <el-form-item label>
          <sd-weather-alert :alert="alert"></sd-weather-alert>
        </el-form-item>
      </el-form>
      <el-form label-width="70px" size="mini">
        <el-form-item>
          <span slot="label" v-t="'weather.feel'"></span>
          <el-input readonly :value="weather.text"></el-input>
        </el-form-item>
        <el-form-item>
          <span slot="label" v-t="'weather.temp'"></span>
          <el-input readonly :value="weather.temp">
            <template #append>℃</template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <span slot="label" v-t="'weather.hum'"></span>
          <el-input readonly :value="weather.humidity">
            <template #append>%</template>
          </el-input>
        </el-form-item>
      </el-form>
    </div>
  </sd-card>
</template>

<script>
import { weather, warning } from '@/api/heweather';
import { minutely } from '@/api/caiyun';

import Card from '@/components/card.vue';
import WindIcon from './wind-icon.vue';
import RainChart from './rain-chart.vue';
import WindChart from './wind-chart.vue';
import AlertBadge from './alert-badge.vue';

export default {
  name: 'sd-node-weather',
  inheritAttrs: false,
  props: {
    point: {
      type: Object,
      required: true
    },
    status: {
      type: Object,
      required: true
    },
    msg: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      precipitation: {
        data: [],
        timestamp: Date.now()
      },
      weather: {},
      alert: [],
      interval: null
    };
  },
  methods: {
    getWeather() {
      const { lng, lat } = this.status.status;
      return Promise.all([
        minutely(lng, lat).then(data => {
          this.precipitation = {
            data: data.result.minutely.precipitation,
            timestamp: data.server_time * 1000
          };
        }),
        weather(lng, lat).then(data => this.weather = data.now || {}),
        warning(lng, lat).then(data => this.alert = data.warning || [])
      ]);
    },
    refreshWeather() {
      if (this.status.code !== 0) return;
      this.getWeather();
    }
  },
  watch: {
    ['status.code']() {
      this.refreshWeather();
    },
    ['$i18n.locale']() {
      this.refreshWeather();
      window.clearInterval(this.interval);
      this.interval = window.setInterval(() => this.refreshWeather(), 5 * 60 * 1000);
    }
  },
  mounted() {
    this.refreshWeather();
    this.interval = window.setInterval(() => this.refreshWeather(), 5 * 60 * 1000);
  },
  beforeDestroy() {
    if (this.interval !== null) {
      window.clearInterval(this.interval);
    }
  },
  components: {
    [Card.name]: Card,
    [WindIcon.name]: WindIcon,
    [RainChart.name]: RainChart,
    [WindChart.name]: WindChart,
    [AlertBadge.name]: AlertBadge
  }
};
</script>

<style>
.el-card.weather {
  /* make chartist's tooltip visible */
  overflow: visible;
}
.weather .el-card__body {
  display: flex;
  padding: 8px 0 0;
  flex-direction: column;
  align-items: center;
}
.weather .el-input {
  width: 140px;
}
.weather .el-form-item {
  margin-bottom: 6px;
}
.weather__column {
  position: relative;
}
.weather__column--multi {
  display: flex;
}
.weather__coord {
  display: flex;
  align-items: center;
}
</style>
