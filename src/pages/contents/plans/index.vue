<template>
  <el-container class="wrapper">
    <plan-view v-if="$store.state.planPage==='view'" v-cloak></plan-view>
    <plan-add v-if="$store.state.planPage==='add'" v-cloak></plan-add>
    <plan-edit v-if="$store.state.planPage==='edit'" v-cloak></plan-edit>
  </el-container>
</template>

<script>
  import Add from './add'
  import View from './view'
  import Edit from './edit'

  export default {
    data() {
      return {

      }
    },
    components: {
      'plan-add':Add,
      'plan-view':View,
      'plan-edit':Edit
    },
    methods: {

    }
  }
</script>

<style scoped>
  .content {
    width: 100%;
    min-height: 100%;
    padding: 0 0 0 10px;
  }
</style>
