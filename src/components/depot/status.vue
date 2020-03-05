<template>
  <el-card class="depot__status drone__status sd-card sd-card--dense" shadow="never">
    <div class="status__item">
      <sd-icon value="depot-blue" :size="18" />
      <span class="status__text">{{ depotStatus }}</span>
    </div>
    <div class="status__item">
      <sd-icon value="electrical" :size="18" />
      <span class="status__text">{{ power }}</span>
    </div>
    <div class="status__item">
      <sd-icon value="depot" :size="18" />
      <span class="status__text">{{ door }}</span>
    </div>
    <div class="status__item">
      <sd-icon value="expand" :size="18" />
      <span class="status__text">{{ fix }}</span>
    </div>
    <div class="status__item">
      <sd-icon value="battery" :size="18" />
      <span class="status__text">{{ chargerStatus }}</span>
    </div>
    <div class="status__item" ref="voltage" @click="triggerPopover('voltage')">
      <sd-icon value="voltage" :size="18" />
      <span class="status__text">{{ V }}</span>
    </div>
    <div class="status__item" ref="current" @click="triggerPopover('current')">
      <sd-icon value="electricity" :size="18" />
      <span class="status__text">{{ A }}</span>
    </div>
    <div class="status__item" ref="power" @click="triggerPopover('power')">
      <sd-icon value="lightning-bolt" :size="18" />
      <span class="status__text">{{ W }}</span>
    </div>
    <el-popover
      ref="popover"
      trigger="manual"
      popper-class="status__popover"
      v-model="popover.show"
    >
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
      <div class="status__caption ct-label" v-t="`depot.charger.${popover.type}_chart`"></div>
      <div class="status__chart" :class="popover.type" ref="chart"></div>
    </el-popover>
  </el-card>
</template>

<script>
import Chartist from 'chartist';
import 'chartist-plugin-tooltips';

import Icon from '@/components/sd-icon.vue';

export default {
  name: 'sd-depot-status',
  props: {
    point: {
      type: Object,
      required: true
    },
    msg: {
      type: Object,
      required: true
    }
  },
  data: () => ({
    popover: {
      show: false,
      type: 'voltage'
    },
    charge: {
      info: { /* set_voltage: 5.5, set_current: 3.5 */ },
      history_info: { /* timestamp: 1582975681, intervalsl: 30 */ },
      history: [/* { V: 1.7, A: 0.4 } */]
    }
  }),
  computed: {
    s() {
      return this.msg.depot_status;
    },
    c() {
      return this.msg.charger;
    },
    depotStatus() {
      return this.$t(`depot.status.${this.s.status}`);
    },
    power() {
      return this.$t('depot.power.status', { s: this.$t(`depot.power.${this.s.power}`) });
    },
    door() {
      return this.$t('depot.door.status', { s: this.$t(`depot.door.${this.s.door}`) });
    },
    fix() {
      return this.$t('depot.fix.status', { s: this.$t(`depot.fix.${this.s.fix}`) });
    },
    chargerStatus() {
      return this.$t('depot.charger.status', { s: this.$t(`depot.status.${this.c.status}`) });
    },
    V() {
      const { V } = this.c;
      return this.$t('depot.charger.voltage', { V });
    },
    A() {
      const { A } = this.c;
      return this.$t('depot.charger.current', { A });
    },
    W() {
      const { V, A } = this.c;
      return this.$t('depot.charger.power', { W: V * A });
    }
  },
  methods: {
    updateChargerInfo() {
      this.$mqtt(this.point.node_id, { mission: 'charger_info' })
        .then(result => {
          for (const h of result.history) {
            h.V = Number.parseFloat(h.V);
            h.A = Number.parseFloat(h.A);
          }
          this.charge = result;
        });
    },
    formatTime(offset) {
      const { timestamp, intervalsl } = this.charge.history_info;
      const dt = new Date((timestamp - intervalsl * offset) * 1000);
      return dt.toLocaleString('zh', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, });
    },
    updateChart(type) {
      const datum = type === 'voltage' ? (h => h.V)
        : type === 'current' ? (h => h.A)
          : (h => h.V * h.A);
      /** @type {Chartist.IChartistData} */
      const data = { labels: [], series: [[]] };
      for (let i = this.charge.history.length - 1; i >= 0; i--) {
        const h = this.charge.history[i];
        const time = this.formatTime(i);
        data.labels.push(time);
        data.series[0].push({x: i, y:datum(h)});
      }
      const size = data.series[0].length;
      let step = 1;
      if (size > 5) {
        step = Math.ceil(size / 4);
      }
      if (this.chart === null) {
        /** @type {Chartist.ILineChartOptions} */
        const options = {
          width: '420px',
          height: '150px',
          axisX: {
            labelInterpolationFnc: (value, index) => {
              return (index % step === 0) ? value : null;
            }
          },
          axisY: { low: 0 },
          plugins: [
            Chartist.plugins.tooltip({
              anchorToPoint: true,
              tooltipOffset: { x: 0, y: -14 },
              tooltipFnc: (meta, value) => {
                const [offset, num] = value.split(',');
                return `${this.formatTime(offset)}, ${num}`;
              }
            })
          ]
        };
        this.chart = new Chartist.Line(this.$refs.chart, data, options);
      } else {
        this.chart.update(data);
      }
    },
    triggerPopover(type) {
      if (this.popover.type === type && this.popover.show === true) {
        this.popover.show = false;
        return;
      }
      this.updateChart(type);
      this.popover.type = type;
      if (!this.$refs.popover.popperJS) {
        this.$refs.popover.referenceElm = this.$refs[type];
        this.popover.show = true;
      } else if (this.popover.show) {
        this.$refs.popover.popperJS._reference = this.$refs[type];
        this.$refs.popover.updatePopper();
      } else {
        this.popover.show = true;
      }
    },
    handleDocumentClick(e) {
      if (!this.popover.show || this.$refs[this.popover.type].contains(e.target)) return;
      this.popover.show = false;
    }
  },
  created() {
    this.chart = null;
    this.updateChargerInfo();
  },
  mounted() {
    window.document.addEventListener('click', this.handleDocumentClick);
  },
  beforeDestroy() {
    window.document.removeEventListener('click', this.handleDocumentClick);
  },
  components: {
    [Icon.name]: Icon
  }
};
</script>

<style>
.status__popover {
  width: 420px;
}
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
  text-align: center;
}

/* chartist style */
.status__chart .ct-label {
  white-space: nowrap;
}
.status__chart .ct-series .ct-line {
  stroke-width: 2px;
}
.status__chart .ct-series .ct-point {
  stroke-width: 8px;
  stroke: transparent;
}
.status__chart.voltage .ct-series .ct-line,
.status__chart.voltage .ct-series .ct-point:hover {
  stroke: #409eff;
}
.status__chart.current .ct-series .ct-line,
.status__chart.current .ct-series .ct-point:hover {
  stroke: #67c23a;
}
.status__chart.power .ct-series .ct-line,
.status__chart.power .ct-series .ct-point:hover {
  stroke: #e6a23c;
}

/* chartist-plugin-tooltips tooltip style */
.status__chart .chartist-tooltip {
  font-family: inherit;
  font-weight: normal;
  background: white;
  filter: drop-shadow(0 2px 12px rgba(0, 0, 0, 0.1));
  border: 1px solid #ebeef5;
}
.status__chart .chartist-tooltip::before {
  margin-left: -6px;
  border-width: 6px;
  border-top-color: white;
}
</style>
