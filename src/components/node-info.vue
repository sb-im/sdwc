<template>
  <el-card shadow="never">
    <template #header>
      <div class="sd-node-card__head">
        <sd-icon value="airport/a_infos"></sd-icon>
        <span class="sd-node-card__title">节点信息 ##需要翻译</span>
      </div>
    </template>
    <el-form :inline="true">
      <el-form-item label="id">
        <el-input :value="node.id" readonly></el-input>
      </el-form-item>
      <el-form-item label="name">
        <el-input :value="node.name" readonly></el-input>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script>
import Icon from '@/components/sd-icon.vue';

export default {
  name: 'sd-node-info',
  props: {
    node: {
      type: Object,
      required: true
    }
  },
  components: {
    [Icon.name]: Icon
  }
};
</script>
