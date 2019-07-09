<template>
  <sd-card class="battery" icon="battery" :title="$t('common.battery.title')">
    <el-form label-width="90px" size="mini">
      <el-form-item :label="$t('common.battery.temp')">
        <el-input readonly :value="battery.temp">
          <template #append>℃</template>
        </el-input>
      </el-form-item>
      <el-form-item :label="$t('common.battery.cap')">
        <el-input readonly :value="battery.cap">
          <template #append>mAh</template>
        </el-input>
      </el-form-item>
      <el-form-item :label="$t('common.battery.cur')">
        <el-input readonly :value="current">
          <template #append>A</template>
        </el-input>
      </el-form-item>
      <el-form-item :label="$t('common.battery.remain')">
        <el-input readonly :value="battery.remain" ref="inputRemain">
          <template #append>%</template>
        </el-input>
      </el-form-item>
      <el-form-item :label="$t('common.battery.cycle')">
        <el-input readonly :value="battery.cycle"></el-input>
      </el-form-item>
      <el-form-item :label="$t('common.battery.bal')">
        <el-input readonly :value="battery.bal"></el-input>
      </el-form-item>
      <el-form-item :label="$t('common.battery.vol_cell')" style="width:480px">
        <el-input readonly :value="voltage">
          <template #append>mV</template>
        </el-input>
      </el-form-item>
      <el-form-item :label="$t('common.battery.id')">
        <el-input readonly :value="battery.id"></el-input>
      </el-form-item>
      <el-form-item :label="$t('common.battery.status')" class="battery__status">
        <el-tag
          v-for="(val, index) of battery.status"
          :key="index"
          size="medium"
        >{{ $t(`common.battery.st.${val}`) }}</el-tag>
      </el-form-item>
    </el-form>
  </sd-card>
</template>

<script>
import { mapState } from 'vuex';

import Card from '@/components/card.vue';

export default {
  name: 'sd-node-battery',
  props: {
    point: {
      type: Object,
      required: true
    },
    status: {
      type: Number,
      required: true
    }
  },
  computed: {
    ...mapState({
      battery(state) {
        const node = state.node.find(n => n.info.id === this.point.node_id);
        if (!node || !node.msg.battery) return {};
        return node.msg.battery;
      }
    }),
    current() {
      const I = ((this.battery.cur || 0) / 1000);
      return Math.abs(I) > 1 ? I.toFixed(1) : I.toFixed(2);
    },
    voltage() {
      return (this.battery.vol_cell || '').replace(/\//g, ' / ');
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
  width: 100%;
}
.battery__status .el-tag:not(:last-child) {
  margin-right: 8px;
}
</style>
