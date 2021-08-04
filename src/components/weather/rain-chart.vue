<template>
  <div class="weather__column">
    <div class="weather__caption" v-t="'weather.rain.caption'"></div>
    <div class="weather__chart" ref="chart"></div>
  </div>
</template>

<script>
import Chartist from 'chartist';

import { h, hs } from '@/util/create-element';

export default {
  name: 'sd-weather-rain',
  props: {
    data: {
      type: Array,
      default: () => []
    },
    timestamp: {
      type: Number,
      default: () => Date.now()
    }
  },
  methods: {
    /**
     * @param {number} offset in minute
     */
    formatTime(offset) {
      const dt = new Date(this.timestamp + offset * 60 * 1000);
      return this.$d(dt, 'time');
    },
    draw() {
      /** @type {Chartist.IChartistData} */
      const data = {
        series: [this.data.map((value, index) => ({ x: index, y: value }))]
      };
      if (this.chart === null) {
        /** @type {Chartist.ILineChartOptions} */
        const options = {
          axisX: {
            type: Chartist.FixedScaleAxis,
            ticks: [0, 15, 30, 45],
            high: 59,
            low: 0,
            labelInterpolationFnc: value => this.formatTime(value)
          },
          showArea: true,
          plugins: [
            Chartist.plugins.tooltip({
              anchorToPoint: true,
              tooltipOffset: { x: 0, y: -14 },
              tooltipFnc: (meta, value) => {
                const [minute, rain] = value.split(',');
                return `${this.formatTime(minute)} , ${rain}`;
              }
            })
          ]
        };
        this.chart = new Chartist.Line(this.$refs.chart, data, options);
        // append unit on x axis after chart created
        this.chart.eventEmitter.addEventHandler('created', () => {
          this.chart.svg._node.getElementsByClassName('ct-labels')[0].append(
            hs('foreignObject', { x: 10, y: 130, height: 20, width: 30 }, [
              h('span', { class: 'ct-label ct-horizontal ct-end' }, ['(mm)'])
            ])
          );
        });
      } else {
        this.chart.update(data);
      }
    },
  },
  watch: {
    data() {
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

/* chartist line-chart color */
.weather .ct-series .ct-line,
.weather .ct-series .ct-point:hover {
  stroke: #87cefa;
}
.weather .ct-series .ct-area {
  fill: #87cefa;
}
</style>
