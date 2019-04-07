<template>
  <div class="depot">
    <el-card shadow="never">
      <div class="sd-node-card__head" slot="header">
        <sd-icon value="airport/a_infos"></sd-icon>
        <span class="sd-node-card__title">节点信息 ##需要翻译</span>
      </div>
      <div>
        <p>id: {{this.node.id}} name: {{this.node.name}}</p>
      </div>
    </el-card>
    <sd-node-depot-control :node="node" :status="status"></sd-node-depot-control>
  </div>
</template>

<script>
import Icon from '@/components/sd-icon.vue';
import Control from './control.vue';

export default {
  name: 'sd-node-depot',
  props: {
    node: {
      type: Object,
      required: true
    },
    message: {
      type: Array,
      required: true
    },
    status: {
      type: Number,
      required: true
    }
  },
  components: {
    [Icon.name]: Icon,
    [Control.name]: Control
  }
};
</script>

<style>
</style>
