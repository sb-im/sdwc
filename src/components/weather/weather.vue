<template>
  <sd-card class="weather" icon="barometer" :title="$t('depot.weather')">
    <div class="weather__column">
      <div class="weather__caption">{{$t('depot.weather_caption')}}</div>
      <div class="weather__chart" ref="rainChart" v-loading="rainChartLoading"></div>
    </div>
    <div class="weather__column">
      <div class="weather__caption">{{$t('depot.wind_caption')}}</div>
      <div class="weather__chart" ref="windChart"></div>
    </div>
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
import Chartist from 'chartist';
import 'chartist-plugin-tooltips';

import { realtime, minutely } from '@/api/caiyun';

import Card from '@/components/card.vue';
import WindIcon from './wind-icon.vue';

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
        s: null,
        realtime: null,
        minutely: null
      },
      /** @type {Chartist.IChartistLineChart} */
      rainChart: null,
      rainChartLoading: false,
      windChart: null,
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
        // aiPressure: w.Pa
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
    drawRainChart() {
      const time = minute => new Date(this.caiyun.minutely.server_time * 1000 + minute * 60 * 1000).toLocaleString('zh', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
      });
      /** @type {Chartist.IChartistData} */
      const data = {
        series: [this.caiyun.minutely.result.minutely.precipitation.map((y, x) => ({ x, y }))]
      };
      /** @type {Chartist.ILineChartOptions} */
      const options = {
        axisX: {
          type: Chartist.FixedScaleAxis,
          ticks: [0, 15, 30, 45],
          high: 59,
          low: 0,
          labelInterpolationFnc: value => time(value)
        },
        axisY: {
          type: Chartist.FixedScaleAxis,
          ticks: [0.03, 0.25, 0.35, 0.48],
          high: 1,
          low: 0
        },
        showPoint: true,
        showArea: true,
        plugins: [
          Chartist.plugins.tooltip({
            tooltipOffset: { x: 0, y: -22 },
            tooltipFnc: (meta, value) => {
              const [minute, rain] = value.split(',');
              return `${time(minute)} , ${rain}`;
            }
          })
        ]
      };
      if (this.rainChart === null) {
        this.rainChart = new Chartist.Line(this.$refs.rainChart, data, options);
      } else {
        this.rainChart.update(data, options);
      }
    },
    drawWindChart() {
      const latest = this.weatherRec[this.weatherRec.length - 1];
      /** @type {Chartist.IChartistData} */
      const data = {
        series: [this.weatherRec.map(r => ({ x: Math.trunc((r.time - latest.time) / 1000), y: r.weather.WS / 10 }))]
      };
      if (this.windChart === null) {
        /** @type {Chartist.ILineChartOptions} */
        const options = {
          axisX: {
            type: Chartist.FixedScaleAxis,
            ticks: [-59, -3],
            high: 0,
            low: -59,
            labelInterpolationFnc: value => value < -30 ? this.$t('depot.min_before') : this.$t('depot.now')
          },
          showPoint: true,
          showArea: true,
          plugins: [
            Chartist.plugins.tooltip({
              tooltipOffset: { x: 0, y: -22 },
              tooltipFnc: (meta, value) => value.split(',')[1] + ' m/s'
            })
          ]
        };
        this.windChart = new Chartist.Line(this.$refs.windChart, data, options);
      } else {
        this.windChart.update(data);
      }
    },
    refreshWeather() {
      if (!this.position) return;
      this.getRealtime();
      this.rainChartLoading = true;
      this.getMinutely().then(() => {
        this.drawRainChart();
        this.rainChartLoading = false;
      });
    }
  },
  watch: {
    position() {
      this.refreshWeather();
    },
    weatherRec() {
      this.drawWindChart();
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
    if (this.rainChart !== null) {
      this.rainChart.detach();
    }
    if (this.windChart !== null) {
      this.windChart.detach();
    }
  },
  components: {
    [Card.name]: Card,
    [WindIcon.name]: WindIcon
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
.weather__caption {
  font-size: 14px;
  text-align: center;
  color: #606266;
}
.weather__chart {
  position: relative;
  height: 160px;
  width: 600px;
}
.weather .el-input {
  width: 140px;
}
.weather .el-form-item {
  margin-bottom: 6px;
}
.weather__column--multi {
  display: flex;
}
.weather__coord {
  display: flex;
  align-items: center;
}

/* chartist line-chart style */
.weather .ct-series-a .ct-line,
.weather .ct-series-a .ct-point {
  stroke: rgb(135, 206, 250);
}
.weather .ct-series-a .ct-area {
  fill: rgb(135, 206, 250);
}
.weather .ct-series-a .ct-line {
  stroke-width: 2px;
}
.weather .ct-series-a .ct-point {
  stroke: transparent;
  stroke-width: 8px;
}
.weather .ct-series-a .ct-point:hover {
  stroke: rgb(65, 178, 223);
}

/* chartist-plugin-tooltips tooltip style */
.weather .chartist-tooltip {
  font-family: inherit;
  font-weight: normal;
  background: white;
  filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.4));
}
.weather .chartist-tooltip::before {
  border-top-color: white;
}
</style>
