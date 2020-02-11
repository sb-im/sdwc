<template>
  <sd-card class="battery" icon="battery" title="battery.title">
    <el-form label-width="90px" size="mini">
      <el-form-item>
        <span slot="label" v-t="'battery.id'"></span>
        <el-input readonly :value="battery.id"></el-input>
      </el-form-item>
      <el-form-item>
        <span slot="label" v-t="'battery.temp'"></span>
        <el-input readonly :value="battery.temp">
          <template #append>℃</template>
        </el-input>
      </el-form-item>
      <el-form-item>
        <span slot="label" v-t="'battery.cap'"></span>
        <el-input readonly :value="battery.cap">
          <template #append>mAh</template>
        </el-input>
      </el-form-item>
      <el-form-item>
        <span slot="label" v-t="'battery.cur'"></span>
        <el-input readonly :value="current">
          <template #append>A</template>
        </el-input>
      </el-form-item>
      <el-form-item>
        <span slot="label" v-t="'battery.remain'"></span>
        <el-input readonly :value="battery.remain" ref="inputRemain">
          <template #append>%</template>
        </el-input>
      </el-form-item>
      <el-form-item>
        <span slot="label" v-t="'battery.cycle'"></span>
        <el-input readonly :value="battery.cycle"></el-input>
      </el-form-item>
      <el-form-item>
        <span slot="label" v-t="'battery.vol'"></span>
        <el-input readonly :value="totalVoltage">
          <template #append>V</template>
        </el-input>
      </el-form-item>
      <el-form-item style="width:480px">
        <span slot="label" v-t="'battery.vol_cell'"></span>
        <el-input readonly :value="voltage">
          <template #append>mV</template>
        </el-input>
      </el-form-item>
      <el-form-item class="battery__status">
        <span slot="label" v-t="'battery.status'"></span>
        <el-tag v-for="(val, index) of battery.status" :key="index" size="medium">
          <span v-t="`battery.st.${val}`"></span>
        </el-tag>
      </el-form-item>
    </el-form>
  </sd-card>
</template>

<script>
import Card from '@/components/card.vue';

export default {
  name: 'sd-node-battery',
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
  computed: {
    battery() {
      return this.msg.battery;
    },
    current() {
      const I = ((this.battery.cur || 0) / 1000);
      return Math.abs(I) > 1 ? I.toFixed(1) : I.toFixed(2);
    },
    voltage() {
      return (this.battery.vol_cell || '').replace(/\//g, ' / ');
    },
    totalVoltage() {
      return (this.battery.vol_cell || '').split('/').reduce((a, b) => +b + a, 0) / 1000;
    }
  },
  watch: {
    'battery.remain': {
      immediate: true,
      handler(val) {
        this.$nextTick(() => {
          const el = this.$refs.inputRemain.$el.getElementsByTagName('input')[0];
          el.style.background = `linear-gradient(to right, #c6e2ff ${val}%, transparent ${val}%)`;
        });
      }
    }
  },
  components: {
    [Card.name]: Card
  }
};
</script>

<style>
.battery .el-card__body {
  padding-bottom: 12px;
}
.battery .el-form {
  display: flex;
  flex-wrap: wrap;
}
.battery .el-form-item {
  width: 240px;
  margin-bottom: 8px;
}
.battery__status {
  min-width: 100%;
}
.battery__status .el-tag:not(:last-child) {
  margin-right: 8px;
}
</style>
