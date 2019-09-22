<template>
  <div class="weather__column">
    <div class="weather__caption">{{$t('depot.wind_caption')}}</div>
    <div class="weather__chart" ref="chart"></div>
    <div class="weather__label ct-label">
      <span>(m/s) {{$t('depot.min_before')}}</span>
      <span>{{$t('depot.now')}}</span>
    </div>
  </div>
</template>

<script>
import Chartist from 'chartist';
import 'chartist-plugin-tooltips';

export default {
  name: 'sd-weather-wind',
  props: {
    weatherRec: {
      type: Array,
      required: true
    }
  },
  methods: {
    draw() {
      let points = [];
      const len = this.weatherRec.length;
      if (len >= 60) {
        points = this.weatherRec.slice(0, 60);
      } else {
        points = new Array(60 - len).concat(this.weatherRec);
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
    weatherRec() {
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
  left: 18px;
  right: 16px;
  display: flex;
  justify-content: space-between;
}
</style>
