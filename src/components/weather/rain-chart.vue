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
    minutely: {
      type: Array,
      required: true
    }
  },
  methods: {
    /**
     * @param {number} offset in minute
     */
    shortTime(offset) {
      const updateTime = new Date(this.minutely[0].fxTime).getTime();
      const dt = new Date(updateTime + offset * 5 * 60 * 1000);
      return this.$d(dt, 'time');
    },
    draw() {
      /** @type {Chartist.IChartistData} */
      const data = {
        series: [this.minutely.map((item, index) => ({ x: index, y: item.precip }))]
      };
      if (this.chart === null) {
        /** @type {Chartist.ILineChartOptions} */
        const options = {
          axisX: {
            type: Chartist.FixedScaleAxis,
            ticks: [0, 6, 12, 18],
            high: 23,
            low: 0,
            labelInterpolationFnc: value => this.shortTime(value)
          },
          showArea: true,
          plugins: [
            Chartist.plugins.tooltip({
              anchorToPoint: true,
              tooltipOffset: { x: 0, y: -14 },
              tooltipFnc: (meta, value) => {
                const [minute, rain] = value.split(',');
                return `${this.shortTime(minute)} , ${rain}`;
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

/* chartist line-chart color */
.weather .ct-series .ct-line,
.weather .ct-series .ct-point:hover {
  stroke: #87cefa;
}
.weather .ct-series .ct-area {
  fill: #87cefa;
}
</style>
