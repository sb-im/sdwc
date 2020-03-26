<template>
  <sd-card class="weather" icon="barometer" title="weather.title">
    <sd-weather-rain :caiyun="caiyun" :loading="caiyunLoading" ref="rain"></sd-weather-rain>
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
          <sd-weather-alert :alert="caiyun.alert"></sd-weather-alert>
        </el-form-item>
      </el-form>
      <el-form label-width="70px" size="mini">
        <el-form-item>
          <span slot="label" v-t="'weather.feel'"></span>
          <el-input readonly :value="caiyunText.weather"></el-input>
        </el-form-item>
        <el-form-item>
          <span slot="label" v-t="'weather.temp'"></span>
          <el-input readonly :value="caiyunText.temperature">
            <template #append>℃</template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <span slot="label" v-t="'weather.hum'"></span>
          <el-input readonly :value="caiyunText.humidity">
            <template #append>%</template>
          </el-input>
        </el-form-item>
      </el-form>
    </div>
  </sd-card>
</template>

<script>
import { weather } from '@/api/caiyun';

import Card from '@/components/card.vue';
import WindIcon from './wind-icon.vue';
import RainChart from './rain-chart.vue';
import WindChart from './wind-chart.vue';
import AlertBadge from './alert-badge.vue';

const Skycon = {
  CLEAR_DAY: 'weather.clear_day',
  CLEAR_NIGHT: 'weather.clear_night',
  PARTLY_CLOUDY_DAY: 'weather.partly_cloudy',
  PARTLY_CLOUDY_NIGHT: 'weather.partly_cloudy',
  CLOUDY: 'weather.cloudy',
  RAIN: 'weather.rainy',
  SNOW: 'weather.snowy',
  WIND: 'weather.windy',
  HAZE: 'weather.haze',
};

export default {
  name: 'sd-node-weather',
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
      caiyun: {
        realtime: null,
        minutely: null,
        alert: null,
        server_time: 0
      },
      caiyunLoading: false,
      interval: null
    };
  },
  computed: {
    caiyunText() {
      if (!this.caiyun.realtime || this.caiyun.realtime.status !== 'ok') {
        return {
          weather: '...',
          temperature: '...',
          humidity: '...'
        };
      }
      const r = this.caiyun.realtime;
      return {
        weather: this.$t(Skycon[r.skycon]),
        temperature: (r.temperature - 273.15).toFixed(1),
        humidity: (r.humidity * 100).toFixed(0)
      };
    }
  },
  methods: {
    getWeather() {
      const { lng, lat } = this.status.status;
      return weather(lng, lat).then(res => {
        this.caiyun.minutely = res.result.minutely;
        this.caiyun.realtime = res.result.realtime;
        this.caiyun.alert = res.result.alert;
        this.caiyun.server_time = res.server_time;
      });
    },
    refreshWeather() {
      if (this.status.code !== 0) return;
      this.caiyunLoading = true;
      this.getWeather().then(() => {
        this.caiyunLoading = false;
        this.$refs.rain.draw();
      });
    }
  },
  watch: {
    ['status.code']() {
      this.refreshWeather();
    }
  },
  mounted() {
    this.refreshWeather();
    this.interval = window.setInterval(() => this.refreshWeather(), 120 * 1000);
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
