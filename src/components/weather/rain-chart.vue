<template>
  <div class="weather__column">
    <div class="weather__caption">{{$t('depot.weather_caption')}}</div>
    <div class="weather__chart" ref="chart" v-loading="loading"></div>
  </div>
</template>

<script>
import Chartist from 'chartist';
import 'chartist-plugin-tooltips';

export default {
  name: 'sd-weather-rain',
  props: {
    caiyun: {
      type: Object,
      required: true
    },
    loading: {
      type: Boolean
    }
  },
  methods: {
    /** @param {number} minute */
    shortTime(minute) {
      const dt = new Date(this.caiyun.minutely.server_time * 1000 + minute * 60 * 1000);
      return dt.toLocaleString('zh', { hour: '2-digit', minute: '2-digit', hour12: false, });
    },
    draw() {
      /** @type {Chartist.IChartistData} */
      const data = {
        series: [this.caiyun.minutely.result.minutely.precipitation.map((y, x) => ({ x, y }))]
      };
      if (this.chart === null) {
        /** @type {Chartist.ILineChartOptions} */
        const options = {
          axisX: {
            type: Chartist.FixedScaleAxis,
            ticks: [0, 15, 30, 45],
            high: 59,
            low: 0,
            labelInterpolationFnc: value => this.shortTime(value)
          },
          axisY: {
            type: Chartist.FixedScaleAxis,
            ticks: [0.03, 0.25, 0.35, 0.48],
            high: 1,
            low: 0
          },
          showArea: true,
          plugins: [
            Chartist.plugins.tooltip({
              tooltipOffset: { x: 0, y: -22 },
              tooltipFnc: (meta, value) => {
                const [minute, rain] = value.split(',');
                return `${this.shortTime(minute)} , ${rain}`;
              }
            })
          ]
        };
        this.chart = new Chartist.Line(this.$refs.chart, data, options);
      } else {
        this.chart.update(data);
      }
    },
  },
  mounted() {
    this.chart = null;
  },
  beforeDestroy() {
    if (this.chart !== null) {
      this.chart.detach();
    }
  }
};
</script>

<style>
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
