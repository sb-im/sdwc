<template>
  <el-main class="content">
    <el-header height="70px" class="header font-24">
      <img src="../../../assets/images/task/task_add.svg"/>新建任务
    </el-header>
    <el-row type="flex" class="edit" :gutter="20" tag="section">
      <el-col :span="8" tag="ul">
        <li>
          <div class="edit-item">
            <img src="../../../assets/images/task/task_info.svg"/>任务名称：
            <el-input class="d-b"></el-input>
          </div>
          <div class="edit-item">任务描述：
            <el-input type="textarea" class="d-b"></el-input>
          </div>
        </li>
        <li class="edit-item">
          <img src="../../../assets/images/task/task_frequency.svg"/>执行频次：
          <el-select class="d-b" v-model="frequency" placeholder="请选择执行频次">
            <el-option label="手动" value="1"></el-option>
            <el-option label="一次" value="2"></el-option>
            <el-option label="每周" value="3"></el-option>
            <el-option label="每月" value="4"></el-option>
          </el-select>
        </li>
        <li class="edit-item">
          <img src="../../../assets/images/task/task_first.svg"/>首次执行时间：
          <el-date-picker style="width: 100%" type="datetime" placeholder="请选择首次执行时间" v-model="date"></el-date-picker>
        </li>
        <li class="edit-item">
          <img src="../../../assets/images/task/task_file.svg"/>航点任务文件：
          <el-upload class="d-ib">
            <el-button type="primary" icon="el-icon-upload">上传航点任务文件</el-button>
          </el-upload>
        </li>
      </el-col>
      <el-col :span="16">
        <div class="upload text-c">
          <el-upload class="upload-box d-ib va-m over-h">
            <img src="../../../assets/images/task/task_upload.svg" alt=""/>
            <el-button type="primary" icon="el-icon-upload">上传预览图(可选)</el-button>
          </el-upload>
        </div>
      </el-col>
    </el-row>
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

    }
  }
</script>

<style scoped>
  .header {
    line-height: 60px;
    padding-top: 10px;
    border-bottom: 1px solid #e4eaef;
  }
  .header img {
    width: 36px;
    height: 36px;
    padding-right: 10px;
  }
  .edit {
    padding: 10px 5px;
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

  .upload {
    width: 600px;
    height: 100%;
    border-radius: 5px;
    border: 1px dashed #d8dbe3;
  }
  .upload .upload-box {
    /*backface-visibility: hidden;*/
  }
  .upload .upload-box:after {
    content: "";
    display: inline-block;
    height: 100%;
    width: 0;
    vertical-align: middle;
  }
  .upload .upload-box img{
    width: 40px;
    height: 40px;
    display: block;
    margin: 10px auto 10px;
  }
</style>
