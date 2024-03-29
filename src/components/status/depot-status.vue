<template>
  <sd-status
    :items="items"
    :nodeId="point.node_id"
    :statusCode="status.code"
    :notification="msg.notification"
    @popover="handlePopover"
  >
    <template #popover>
      <el-form size="mini" inline>
        <el-form-item>
          <span slot="label" v-t="'depot.charger.set_voltage'"></span>
          <el-input readonly :value="charge.info.set_voltage">
            <template #append>V</template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <span slot="label" v-t="'depot.charger.set_current'"></span>
          <el-input readonly :value="charge.info.set_current">
            <template #append>A</template>
          </el-input>
        </el-form-item>
      </el-form>
      <div class="status__caption" v-t="`depot.charger.${popover.type}_chart`"></div>
      <div class="status__chart" :class="popover.type" ref="chart"></div>
    </template>
  </sd-status>
</template>

<script>
import Chartist from 'chartist';

import Status from '@/components/status/status.vue';

export default {
  name: 'sd-depot-status',
  inheritAttrs: false,
  props: {
    /** @type {Vue.PropOptions<SDWC.NodePoint>} */
    point: {
      type: Object,
      required: true
    },
    /** @type {Vue.PropOptions<SDWC.NodeConnectionStatus>} */
    status: {
      type: Object,
      required: true
    },
    /** @type {Vue.PropOptions<SDWC.NodeMsg>} */
    msg: {
      type: Object,
      required: true
    }
  },
  data: () => ({
    popover: {
      show: false,
      type: ''
    },
    charge: {
      /** @type {{ set_voltage: number; set_current: number }} */
      info: { /* set_voltage: 5.5, set_current: 3.5 */ },
      /** @type {{ timestamp: number; intervalsl: number }} */
      history_info: { /* timestamp: 1582975681, intervalsl: 30 */ },
      /** @type {{ V: number; A: number }[]} */
      history: [/* { V: 1.7, A: 0.4 } */]
    }
  }),
  computed: {
    /** @returns {SDWC.StatusItem[]} */
    items() {
      const s = this.msg.depot_status;
      const c = this.msg.charger;
      return [
        {
          icon: 'depot-blue',
          value: this.$t(`depot.status.${s.status}`)
        },
        {
          icon: 'electrical',
          name: 'depot.power.status',
          value: this.$t(`depot.power.${s.power}`)
        },
        {
          icon: 'depot',
          name: 'depot.door.status',
          value: this.$t(`depot.door.${s.door}`)
        },
        {
          icon: 'expand',
          name: 'depot.fix.status',
          value: this.$t(`depot.fix.${s.fix}`)
        },
        {
          icon: 'battery',
          name: 'depot.charger.status',
          value: this.$t(`depot.status.${c.status}`)
        },
        {
          icon: 'voltage',
          name: 'depot.charger.voltage',
          value: c.V.toFixed(2),
          unit: 'V',
          popover: 'voltage'
        },
        {
          icon: 'electricity',
          name: 'depot.charger.current',
          value: c.A.toFixed(2),
          unit: 'A',
          popover: 'current'
        },
        {
          icon: 'lightning-bolt',
          name: 'depot.charger.power',
          value: (c.V * c.A).toFixed(2),
          unit: 'W',
          popover: 'power'
        },
      ];
    }
  },
  methods: {
    async updateChargerInfo() {
      const result = await this.$mqtt(this.point.node_id, { mission: 'charger_info' });
      for (const h of result.history) {
        h.V = Number.parseFloat(h.V);
        h.A = Number.parseFloat(h.A);
      }
      this.charge = result;
      if (this.popover.show) {
        this.updateChart(this.popover.type);
      }
      return result;
    },
    scheduleChargerInfoUpdate() {
      const now = Date.now();
      const { timestamp = 0, intervalsl = 0 } = this.charge.history_info;
      if (this.chargerInfoInterval > 0 || now < (timestamp + intervalsl) * 1000) return;
      // update chart data immediately on schedule
      this.updateChargerInfo().then(info => {
        const { timestamp, intervalsl } = info.history_info;
        const timeout = (timestamp + intervalsl + 1) * 1000 - now;
        setTimeout(() => {
          if (this.chargerInfoInterval > 0 || !this.popover.show) return;
          this.updateChargerInfo();
          this.chargerInfoInterval = setInterval(() => this.updateChargerInfo(), intervalsl * 1000);
        }, timeout);
      });
    },
    /**
     * @param {number} offset number of intervals from timestamp
     * @returns {string} time string in `hh:mm:ss`
     */
    formatTime(offset) {
      const { timestamp, intervalsl } = this.charge.history_info;
      const dt = new Date((timestamp - intervalsl * offset) * 1000);
      return this.$d(dt, 'seconds');
    },
    updateChart() {
      /** @type { (h: { V: number, A: number }) => number } */
      const datum = this.popover.type === 'voltage' ? (h => h.V)
        : this.popover.type === 'current' ? (h => h.A)
          : (h => h.V * h.A);
      const history = this.charge.history;
      const size = history.length;
      /** @type {Chartist.IChartistData & { series: { value: number; meta: string }[][] }} */
      const data = { series: [[]] };
      for (let i = size - 1; i >= 0; i--) {
        // meta's value shows on tooltip
        data.series[0].push({ value: datum(history[i]), meta: this.formatTime(i) });
      }
      // show at most 4 labels on X axis
      const step = size <= 4 ? 1 : Math.ceil(size / 4);
      /** @type {Chartist.ILineChartOptions} */
      const options = {
        width: '420px',
        height: '150px',
        showArea: true,
        axisX: {
          labelInterpolationFnc: (value, index) => {
            return (index % step === 0) ? this.formatTime(size - index - 1) : '';
          }
        },
        axisY: { low: 0 },
        plugins: [
          Chartist.plugins.tooltip({
            anchorToPoint: true,
            tooltipOffset: { x: 0, y: -14 },
            tooltipFnc: (meta, value) => {
              return `${meta} , ${Number.parseFloat(value).toFixed(2)}`;
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
    handlePopover(show, type) {
      this.popover.show = show;
      if (!show) return;
      if (type) this.popover.type = type;
      this.scheduleChargerInfoUpdate();
      this.updateChart();
    }
  },
  created() {
    this.chart = null;
    this.chargerInfoInterval = 0;
  },
  beforeDestroy() {
    if (this.chargerInfoInterval > 0) {
      clearInterval(this.chargerInfoInterval);
    }
  },
  components: {
    [Status.name]: Status
  }
};
</script>

<style>
/* popover chart */
.status__popover .el-form-item {
  width: 210px;
  margin-right: 0;
}
.status__popover .el-form-item__label {
  width: 90px;
}
.status__popover .el-form-item__content {
  width: 120px;
}
.status__chart {
  position: relative;
  height: 150px;
  width: 420px;
}
.status__caption {
  font-size: 14px;
  text-align: center;
  color: #606266;
}
/* chartist line-chart color */
.voltage .ct-series .ct-line,
.voltage .ct-series .ct-point:hover {
  stroke: #409eff;
}
.voltage .ct-series .ct-area {
  fill: #409eff;
}
.current .ct-series .ct-line,
.current .ct-series .ct-point:hover {
  stroke: #67c23a;
}
.current .ct-series .ct-area {
  fill: #67c23a;
}
.power .ct-series .ct-line,
.power .ct-series .ct-point:hover {
  stroke: #e6a23c;
}
.power .ct-series .ct-area {
  fill: #e6a23c;
}
</style>
