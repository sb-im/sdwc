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
    <div
      ref="voltage"
      class="status__item expand"
      :class="{ active: popover.show && popover.type === 'voltage' }"
      @click="triggerPopover('voltage')"
    >
      <sd-icon value="voltage" :size="18" />
      <span class="status__text">{{ V }}</span>
      <i class="el-icon-arrow-down el-icon--right"></i>
    </div>
    <div
      ref="current"
      class="status__item expand"
      :class="{ active: popover.show &&  popover.type === 'current' }"
      @click="triggerPopover('current')"
    >
      <sd-icon value="electricity" :size="18" />
      <span class="status__text">{{ A }}</span>
      <i class="el-icon-arrow-down el-icon--right"></i>
    </div>
    <div
      ref="power"
      class="status__item expand"
      :class="{ active: popover.show &&  popover.type === 'power' }"
      @click="triggerPopover('power')"
    >
      <sd-icon value="lightning-bolt" :size="18" />
      <span class="status__text">{{ W }}</span>
      <i class="el-icon-arrow-down el-icon--right"></i>
    </div>
    <el-popover
      ref="popover"
      trigger="manual"
      style="display:none"
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
      <div class="status__caption" v-t="`depot.charger.${popover.type}_chart`"></div>
      <div class="status__chart" :class="popover.type" ref="chart"></div>
    </el-popover>
  </el-card>
</template>

<script>
import Chartist from 'chartist';

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
      type: ''
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
      return this.$t('depot.charger.voltage', { V: V.toFixed(2) });
    },
    A() {
      const { A } = this.c;
      return this.$t('depot.charger.current', { A: A.toFixed(2) });
    },
    W() {
      const { V, A } = this.c;
      return this.$t('depot.charger.power', { W: (V * A).toFixed(2) });
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
        data.series[0].push({ x: i, y: datum(h) });
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
                return `${this.formatTime(offset)} , ${num}`;
              }
            })
          ]
        };
        this.chart = new Chartist.Line(this.$refs.chart, data, options);
      } else {
        this.chart.update(data);
      }
    },
    closePopover() {
      this.popover.show = false;
      setTimeout(() => {
        if (!this.popover.show) this.popover.type = '';
      }, 350);
    },
    triggerPopover(type) {
      if (this.popover.type === type && this.popover.show === true) {
        this.closePopover();
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
      if (!this.popover.show || !this.popover.type || this.$refs[this.popover.type].contains(e.target)) return;
      this.closePopover();
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
.status__item.expand {
  padding: 20px 4px;
  user-select: none;
  cursor: pointer;
  transition: background-color 0.3s;
}
.status__item.active {
  background-color: #00000014;
}
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
  font-size: 14px;
  text-align: center;
  color: #606266;
}

/* chartist line-chart color */
.voltage .ct-series .ct-line,
.voltage .ct-series .ct-point:hover {
  stroke: #409eff;
}
.current .ct-series .ct-line,
.current .ct-series .ct-point:hover {
  stroke: #67c23a;
}
.power .ct-series .ct-line,
.power .ct-series .ct-point:hover {
  stroke: #e6a23c;
}
</style>
