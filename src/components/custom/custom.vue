<template>
  <sd-card class="custom" :icon="icon" :title="title">
    <el-form label-width="90px" size="mini">
      <sd-node-custom-item v-for="item of items" :key="item.field" v-bind="item"></sd-node-custom-item>
    </el-form>
  </sd-card>
</template>

<script>
import { get } from 'lodash';

import Card from '@/components/card.vue';

import CustomItem from './custom-item.vue';

export default {
  name: 'sd-node-custom',
  inheritAttrs: false,
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
    /** @returns {string} */
    icon() {
      return this.point.params.icon || 'views';
    },
    /** @returns {string} */
    title() {
      return this.point.params.title || 'custom.title';
    },
    /** @returns {{ label: string, field: string, unit?: string, value: any }[]} */
    items() {
      const { topic = 'custom', items = [] } = this.point.params;
      const pool = this.msg[topic] || {};
      return items.map(descriptor => ({
        ...descriptor,
        value: get(pool, descriptor.field)
      }));
    }
  },
  components: {
    [Card.name]: Card,
    [CustomItem.name]: CustomItem
  }
};
</script>

<style>
.custom .el-card__body {
  padding-bottom: 12px;
}
.custom .el-form {
  display: flex;
  flex-wrap: wrap;
}
.custom .el-form-item {
  width: 240px;
  margin-bottom: 8px;
}
.custom .el-input__inner {
  padding: 0 0 0 10px;
}
.custom .el-input-group__append {
  padding: 0 10px;
}
</style>
