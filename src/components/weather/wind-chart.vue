<template>
  <div class="weather__column">
    <div class="weather__caption" v-t="'weather.wind.caption'"></div>
    <div class="weather__chart" ref="chart"></div>
    <div class="weather__label ct-label">
      <span>
        <span>(m/s)&#32;</span>
        <span v-t="'weather.min_before'"></span>
      </span>
      <span v-t="'weather.now'"></span>
    </div>
  </div>
</template>

<script>
import Chartist from 'chartist';

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
      });
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
    this.chart = null;
    this.interval = null;
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
