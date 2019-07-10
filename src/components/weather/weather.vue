<template>
  <sd-card class="weather" icon="barometer" :title="$t('depot.weather')">
    <div class="weather__column">
      <div class="weather__caption">{{$t('depot.weather_caption')}}</div>
      <div class="weather__chart" ref="chart" v-loading="chartLoading"></div>
    </div>
    <el-form class="weather__column" label-width="80px" size="mini">
      <el-form-item :label="$t('depot.weather_feel')">
        <el-input readonly :value="weatherText.weather"></el-input>
      </el-form-item>
      <el-form-item :label="$t('depot.temperature')">
        <el-input readonly :value="weatherText.temperature">
          <template #append>℃</template>
        </el-input>
      </el-form-item>
      <el-form-item :label="$t('depot.wind_speed')">
        <el-input readonly :value="weatherText.windSpeed">
          <template #append>km/h</template>
        </el-input>
      </el-form-item>
      <el-form-item :label="$t('depot.wind_direction')">
        <el-input readonly :value="weatherText.windDirection">
          <template #append>deg</template>
        </el-input>
      </el-form-item>
      <el-form-item :label="$t('depot.humidity')">
        <el-input readonly :value="weatherText.humidity">
          <template #append>%</template>
        </el-input>
      </el-form-item>
    </el-form>
  </sd-card>
</template>

<script>
import wretch from 'wretch';
import Chartist from 'chartist';
import 'chartist-plugin-tooltips';

import { realtime, minutely } from '@/api/caiyun';

import Card from '@/components/card.vue';

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
      weather: {
        s: null,
        realtime: null,
        minutely: null
      },
      /** @type {Chartist.IChartistLineChart} */
      chart: null,
      chartLoading: false,
      interval: null
    };
  },
  computed: {
    weatherText() {
      if (!this.weather.realtime || this.weather.realtime.status !== 'ok') {
        return {};
      }
      const r = this.weather.realtime.result;
      return {
        weather: this.$t(Skycon[r.skycon]),
        windSpeed: r.wind.speed,
        windDirection: r.wind.direction,
        temperature: r.temperature,
        humidity: (r.humidity * 100).toFixed(0)
      };
    }
  },
  methods: {
    get3s() {
      return wretch(this.point.name).get().json().then(res => {
        this.weather.s = res;
      });
    },
    getRealtime() {
      return realtime(this.position.lng, this.position.lat).then(res => {
        this.weather.realtime = res;
      });
    },
    getMinutely() {
      return minutely(this.position.lng, this.position.lat).then(res => {
        this.weather.minutely = res;
      });
    },
    drawChart() {
      const time = minute => new Date(this.weather.minutely.server_time * 1000 + minute * 60 * 1000).toLocaleString('zh', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
      });
      /** @type {Chartist.IChartistData} */
      const data = {
        series: [this.weather.minutely.result.minutely.precipitation.map((y, x) => ({ x, y }))]
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
      if (this.chart === null) {
        this.chart = new Chartist.Line(this.$refs.chart, data, options);
      } else {
        this.chart.update(data, options);
      }
    },
    refreshWeather() {
      // this.get3s();
      if (!this.position) return;
      this.getRealtime();
      this.chartLoading = true;
      this.getMinutely().then(() => {
        this.drawChart();
        this.chartLoading = false;
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
    if (this.chart !== null) {
      this.chart.detach();
    }
  },
  components: {
    [Card.name]: Card
  }
};
</script>

<style>
.weather .el-card__body {
  display: flex;
  padding: 12px 0 4px;
  justify-content: space-evenly;
}
.weather__caption {
  text-align: center;
  color: #606266;
}
.weather__chart {
  position: relative;
  height: 160px;
  width: 500px;
}

@media screen and (max-width: 965px) {
  .weather .el-card__body {
    flex-direction: column;
    align-items: center;
  }
  .el-form.weather__column {
    display: flex;
    flex-wrap: wrap;
  }
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

.weather .el-input {
  width: 140px;
}
.weather .el-form-item {
  margin-bottom: 6px;
}
</style>
