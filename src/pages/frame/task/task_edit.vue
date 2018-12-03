<template>
  <el-main class="content">
    <el-header class="header font-24">
      <img src="../../../assets/images/task/t_edit.svg"/>修改任务
    </el-header>
    <el-row type="flex" class="edit" tag="section">
      <el-col class="edit-box" tag="ul">
        <li>
          <div class="edit-item">
            <img src="../../../assets/images/task/t_info.svg"/>任务名称：
            <el-input class="d-b"></el-input>
          </div>
          <div class="edit-item">任务描述：
            <el-input type="textarea" class="d-b"></el-input>
          </div>
        </li>
        <li class="edit-item">
          <img src="../../../assets/images/task/t_frequency.svg"/>执行频次：
          <el-select class="d-b" v-model="frequency" placeholder="请选择执行频次">
            <el-option label="手动" value="1"></el-option>
            <el-option label="一次" value="2"></el-option>
            <el-option label="每周" value="3"></el-option>
            <el-option label="每月" value="4"></el-option>
          </el-select>
        </li>
        <li class="edit-item">
          <img src="../../../assets/images/task/t_first.svg"/>首次执行时间：
          <el-date-picker style="width: 100%" type="datetime" placeholder="请选择首次执行时间" v-model="date"></el-date-picker>
        </li>
        <li class="edit-item d-f">
          <img src="../../../assets/images/task/t_file.svg"/>航点任务文件：
          <div class="btns">
            <el-button class="d-b" type="primary" icon="el-icon-download">下载文件</el-button>
            <el-upload action="#" class="d-b">
              <el-button type="primary" icon="el-icon-upload">重新上传</el-button>
            </el-upload>
          </div>
        </li>
      </el-col>
      <el-col>
        <div class="upload text-c">

        </div>
        <el-upload action="#" class="upload-btn">
          <el-button type="primary" icon="el-icon-upload">重新上传预览图</el-button>
        </el-upload>
      </el-col>
    </el-row>
    <el-footer class="foot-btns">
      <el-button class="font-16" type="warning" icon="el-icon-plus">保存任务</el-button>
      <el-button @click.prevent="backEvent" class="font-16" icon="el-icon-close">放弃并返回</el-button>
      <el-button class="font-16 f-r" type="danger" icon="el-icon-delete">删除任务</el-button>
    </el-footer>
  </el-main>
</template>

<script>
  export default {
    data() {
      return {
        frequency:'',
        date:''
      }
    },
    methods: {
      backEvent(){
        this.$store.commit('taskLink','view');
      }
    }
  }
</script>

<style scoped>
  .header {
    line-height: 60px;
    padding: 0 10px;
    border-bottom: 1px solid #e4eaef;
  }
  .header img {
    width: 36px;
    height: 36px;
    padding-right: 10px;
  }
  .edit {
    padding: 10px 10px 10px 5px;
    border-bottom: 1px solid #e4eaef;
  }
  .edit li {margin-bottom: 10px;}
  .edit-item {
    position: relative;
    font-size: 16px;
    min-height: 38px;
    line-height: 38px;
    padding-left: 40px;
  }
  .edit-item img {
    position: absolute;
    top: 5px;
    left: 0;
    width: 30px;
    height: 30px;
  }
  .edit-item .btns > button{
    margin-bottom: 10px;
  }

  .upload {
    width: 440px;
    height: 320px;
    margin-left: 20px;
    border-radius: 5px;
    background-color: #eee;
  }
  .upload-btn {
    margin-top: 20px;
    margin-left: 20px;
  }
  .foot-btns {
    padding: 0 10px;
    margin-top: 20px;
  }
</style>
