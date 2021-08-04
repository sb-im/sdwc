<template>
  <div class="weather__column">
    <div class="weather__caption" v-t="'weather.wind.caption'"></div>
    <div class="weather__chart" ref="chart"></div>
  </div>
</template>

<script>
import Chartist from 'chartist';

import { h, hs } from '@/util/create-element';

export default {
  name: 'sd-weather-wind',
  props: {
    point: {
      type: Object,
      required: true
    },
    status: {
      type: Object,
      required: true
    },
    weather: {
      type: Object,
      required: true
    }
  },
  data: () => ({
    /** @type {SDWC.NodeWeather[]} */
    points: []
  }),
  methods: {
    async initPoints() {
      this.points = [];
      let time = Math.trunc(Date.now() / 1000);
      const result = await this.$mqtt(this.point.node_id, {
        mission: 'history',
        arg: { topic: 'msg/weather', time: '1m' }
      }).catch(() => { return {}; });
      const entries = Object.entries(result)
        .map(e => [Number.parseInt(e[0]), e[1]])
        .sort((a, b) => b[0] - a[0]);
      for (let [timestamp, data] of entries) {
        while (time >= timestamp) {
          this.points.unshift(data);
          time--;
          if (this.points.length >= 60) return;
        }
      }
      if (this.points.length < 60) {
        /** @type {SDWC.NodeWeather} */
        const filler = { WS: null };
        this.points = new Array(60 - this.points.length).fill(filler).concat(this.points);
      }
    },
    pickPoint() {
      this.points.push(this.weather);
      const len = this.points.length;
      if (len > 60) {
        this.points.splice(0, len - 60);
      }
    },
    scheduleChartUpdate() {
      this.interval = setInterval(() => {
        this.pickPoint();
        this.draw();
      }, 1000);
    },
    draw() {
      /** @type {Chartist.IChartistData} */
      const data = {
        series: [this.points.map(p => p.WS)]
      };
      if (this.chart === null) {
        /** @type {Chartist.ILineChartOptions} */
        const options = {
          axisX: {
            showGrid: false,
            showLable: false
          },
          axisY: {
            low: 0
          },
          fullWidth: true,
          showArea: true,
          plugins: [
            Chartist.plugins.tooltip({
              anchorToPoint: true,
              tooltipOffset: { x: 0, y: -14 }
            })
          ]
        };
        this.chart = new Chartist.Line(this.$refs.chart, data, options);
        // append unit and y axis label after chart created
        this.chart.eventEmitter.addEventHandler('created', () => {
          const labelCalss = { class: 'ct-label ct-horizontal ct-end' };
          this.chart.svg._node.getElementsByClassName('ct-labels')[0].append(
            hs('foreignObject', { x: 10, y: 130, height: 20, width: 30 }, [
              h('span', labelCalss, ['(m/s)'])
            ]),
            hs('foreignObject', { x: 50, y: 130, height: 20, width: 100 }, [
              h('span', labelCalss, [this.$t('weather.min_before')])
            ]),
            hs('foreignObject', { x: 560, y: 130, height: 20, width: 40 }, [
              h('span', labelCalss, [this.$t('weather.now')])
            ])
          );
        });
      } else {
        this.chart.update(data);
      }
    }
  },
  watch: {
    ['status.code']: {
      immediate: true,
      handler(code) {
        if (code === 0) {
          this.initPoints().then(() => {
            this.draw();
            this.scheduleChartUpdate();
          });
        } else {
          if (this.interval !== null) {
            clearInterval(this.interval);
          }
        }
      }
    }
  },
  created() {
    this.interval = null;
  },
  mounted() {
    this.chart = null;
    this.draw();
  },
  beforeDestroy() {
    if (this.interval !== null) {
      clearInterval(this.interval);
    }
    if (this.chart !== null) {
      this.chart.detach();
    }
  }
};
</script>
