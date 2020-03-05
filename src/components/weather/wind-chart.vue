<template>
  <div class="weather__column">
    <div class="weather__caption" v-t="'weather.wind.caption'"></div>
    <div class="weather__chart" ref="chart"></div>
    <div class="weather__label ct-label">
      <span>(m/s)&nbsp;<span v-t="'weather.min_before'"></span></span>
      <span v-t="'weather.now'"></span>
    </div>
  </div>
</template>

<script>
import Chartist from 'chartist';

export default {
  name: 'sd-weather-wind',
  props: {
    weather: {
      type: Array,
      required: true
    }
  },
  methods: {
    draw() {
      let points = [];
      const len = this.weather.length;
      if (len >= 60) {
        points = this.weather.slice(0, 60);
      } else {
        points = new Array(60 - len).concat(this.weather);
      }
      /** @type {Chartist.IChartistData} */
      const data = {
        series: [points.map(r => r.weather.WS / 10)]
      };
      if (this.chart === null) {
        /** @type {Chartist.ILineChartOptions} */
        const options = {
          axisX: {
            showGrid: false,
            showLable: false
          },
          axisY: {
            labelInterpolationFnc: value => value
          },
          fullWidth: true,
          showArea: true,
          plugins: [
            Chartist.plugins.tooltip({
              tooltipOffset: { x: 0, y: -22 },
              tooltipFnc: (meta, value) => value + ' m/s'
            })
          ]
        };
        this.chart = new Chartist.Line(this.$refs.chart, data, options);
      } else {
        this.chart.update(data);
      }
    }
  },
  watch: {
    weather() {
      this.draw();
    }
  },
  mounted() {
    this.chart = null;
    this.draw();
  },
  beforeDestroy() {
    if (this.chart !== null) {
      this.chart.detach();
    }
  }
};
</script>

<style>
.weather__label {
  position: absolute;
  bottom: 18px;
  left: 17px;
  right: 15px;
  display: flex;
  justify-content: space-between;
}
</style>
