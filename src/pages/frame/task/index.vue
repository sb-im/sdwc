<template>
  <el-container class="wrapper">
    <el-aside class="aside pos-r" width="260px">
      <div class="btn-box pos-a text-c">
        <el-button @click.prevent="addTask" class="add-btn font-16" type="primary" icon="el-icon-plus">新建任务</el-button>
      </div>
      <el-menu
        :default-active="activeIndex"
        class="task-list">
        <el-menu-item class="font-18" index="1">安防例行巡检</el-menu-item>
        <el-menu-item class="font-18" index="2">广场施工进展查看</el-menu-item>
      </el-menu>
    </el-aside>
    <task-view v-if="this.$store.state.taskAction==='view'" v-cloak></task-view>
    <task-add v-if="this.$store.state.taskAction==='add'" v-cloak></task-add>
    <task-edit v-if="this.$store.state.taskAction==='edit'" v-cloak></task-edit>
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
        this.$store.commit('taskLink','add')
      }
    }
  }
</script>

<style scoped>
  .wrapper {height:100%;}
  .aside {
    height: 100%;
    padding-top: 85px;
    border-right: 1px solid #e4eaef;
  }
  .aside .btn-box {
    top: 0;
    left: 0;
    right: 0;
    margin: auto;
    line-height: 85px;
    background-color: #fff;
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
