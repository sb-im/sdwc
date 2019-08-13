<template>
  <sd-card class="weather" icon="barometer" :title="$t('depot.weather')">
    <sd-weather-rain :caiyun="caiyun" :loading="caiyunLoading" ref="rain"></sd-weather-rain>
    <sd-weather-wind :weatherRec="weatherRec"></sd-weather-wind>
    <div class="weather__column weather__column--multi">
      <div class="weather__coord">
        <sd-weather-wind-icon :speed="weatherNow.windSpeed" :direction="weatherNow.windDirection"></sd-weather-wind-icon>
      </div>
      <el-form label-width="70px" size="mini">
        <el-form-item :label="$t('depot.wind_speed')">
          <el-input readonly :value="weatherNow.windSpeed">
            <template #append>m/s</template>
          </el-input>
        </el-form-item>
        <el-form-item :label="$t('depot.wind_direction')">
          <el-input readonly :value="weatherNow.windDirection">
            <template #append>deg</template>
          </el-input>
        </el-form-item>
      </el-form>
      <el-form label-width="70px" size="mini">
        <el-form-item :label="$t('depot.weather_feel')">
          <el-input readonly :value="caiyunText.weather"></el-input>
        </el-form-item>
        <el-form-item :label="$t('depot.temperature')">
          <el-input readonly :value="caiyunText.temperature">
            <template #append>℃</template>
          </el-input>
        </el-form-item>
        <el-form-item :label="$t('depot.humidity')">
          <el-input readonly :value="caiyunText.humidity">
            <template #append>%</template>
          </el-input>
        </el-form-item>
      </el-form>
    </div>
  </sd-card>
</template>

<script>
import { realtime, minutely } from '@/api/caiyun';

import Card from '@/components/card.vue';
import WindIcon from './wind-icon.vue';
import RainChart from './rain-chart.vue';
import WindChart from './wind-chart.vue';

const Skycon = {
  CLEAR_DAY: 'weather.clear_day',
  CLEAR_NIGHT: 'weather.clear_night',
  PARTLY_CLOUDY_DAY: 'weather.partly_cloudy',
  PARTLY_CLOUDY_NIGHT: 'weather.partly_cloudy',
  CLOUDY: 'weather.cloudy',
  RAIN: 'weather.rain',
  SNOW: 'weather.snow',
  WIND: 'weather.wind',
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
      type: Number,
      required: true
    },
    position: {
      type: Object,
      required: false
    }
  },
  data() {
    return {
      caiyun: {
        realtime: null,
        minutely: null
      },
      caiyunLoading: false,
      interval: null
    };
  },
  computed: {
    weatherRec() {
      const depot = this.$store.getters.depots.find(d => d.info.id === this.point.node_id);
      return depot ? depot.weatherRec : [];
    },
    weatherNow() {
      const latest = this.weatherRec[this.weatherRec.length - 1];
      if (!latest) return {};
      const w = latest.weather;
      return {
        windSpeed: w.WS / 10,
        windDirection: w.WD,
        // temperature: w.T,
        // humidity: w.RH,
        // airPressure: w.Pa
      };
    },
    caiyunText() {
      if (!this.caiyun.realtime || this.caiyun.realtime.status !== 'ok') {
        return {
          weather: '...',
          temperature: '...',
          humidity: '...'
        };
      }
      const r = this.caiyun.realtime.result;
      return {
        weather: this.$t(Skycon[r.skycon]),
        temperature: r.temperature,
        humidity: (r.humidity * 100).toFixed(0)
      };
    }
  },
  methods: {
    getRealtime() {
      return realtime(this.position.lng, this.position.lat).then(res => {
        this.caiyun.realtime = res;
      });
    },
    getMinutely() {
      return minutely(this.position.lng, this.position.lat).then(res => {
        this.caiyun.minutely = res;
      });
    },
    refreshWeather() {
      if (!this.position) return;
      this.getRealtime();
      this.caiyunLoading = true;
      this.getMinutely().then(() => {
        this.caiyunLoading = false;
        this.$refs.rain.draw();
      });
    }
  },
  watch: {
    position() {
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
