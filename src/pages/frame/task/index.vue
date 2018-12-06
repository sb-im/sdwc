<template>
  <el-container class="wrapper">
    <el-aside class="aside pos-r" width="250px">
      <div class="btn-box pos-a text-c">
        <el-button @click.prevent="addTask" class="add-btn font-16" type="primary" icon="el-icon-plus">新建任务</el-button>
      </div>
      <el-menu
        :default-active="activeIndex"
        class="task-list">
        <el-menu-item class="task-item font-16" index="1">安防例行巡检</el-menu-item>
        <el-menu-item class="task-item font-16" index="2">广场施工进展查看</el-menu-item>
      </el-menu>
    </el-aside>
    <task-view v-if="$store.state.taskPage==='view'" v-cloak></task-view>
    <task-add v-if="$store.state.taskPage==='add'" v-cloak></task-add>
    <task-edit v-if="$store.state.taskPage==='edit'" v-cloak></task-edit>
  </el-container>
</template>

<script>
  import TaskView from './task_view'
  import TaskAdd from './task_add'
  import TaskEdit from './task_edit'

  export default {
    data() {
      return {
        activeIndex:'1'
      }
    },
    components: {
      'task-view':TaskView,
      'task-add':TaskAdd,
      'task-edit':TaskEdit
    },
    methods: {
      addTask(){
        this.$store.commit('taskLink','add');
      }
    }
  }
</script>

<style scoped>
  .aside {
    height: 100%;
    padding-top: 80px;
    border-right: 1px solid #e4eaef;
  }
  .aside .btn-box {
    top: 0;
    left: 0;
    right: 0;
    z-index: 99;
    margin: auto;
    line-height: 80px;
    background-color: #fff;
    border-bottom: 1px solid #e4eaef;
  }
  .aside .add-btn {
    width: 220px;
    height: 45px;
  }
  .aside .task-list {
    border-right: 0;
    height: 100%;
    overflow-y: auto;
  }
  .aside .task-item {
    height: 50px;
    line-height: 50px;
  }
  .aside .task-list .is-active {
    color: #fff;
    background-color: #6cb1f6;
  }

  .content {
    width: 100%;
    height: 100%;
    overflow-y: auto;
    padding: 0 0 0 10px;
  }
</style>
