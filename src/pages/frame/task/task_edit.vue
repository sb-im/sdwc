<template>
  <el-main class="content">
    <el-header height="70px" class="header font-24">
      <img src="../../../assets/images/task/task_see.svg"/>查看任务
      <div class="btn-box f-r font-16">
        <el-button type="warning" icon="el-icon-edit">修改任务</el-button>
        <el-button type="danger" icon="el-icon-check">立即执行</el-button>
      </div>
    </el-header>
    <el-row type="flex" class="infos" tag="section">
      <el-col :md="14" :lg="11" :xl="8">
        <el-col :span="8" tag="ul">
          <li class="info-title"><img src="../../../assets/images/task/task_info.svg"/>任务名称：</li>
          <li class="info-title">任务描述：</li>
          <li class="info-title interval"><img src="../../../assets/images/task/task_time.svg"/>创建时间：</li>
          <li class="info-title"><img src="../../../assets/images/task/task_frequency.svg"/>执行频次：</li>
          <li class="info-title"><img src="../../../assets/images/task/task_first.svg"/>首次执行时间：</li>
          <li class="info-title"><img src="../../../assets/images/task/task_file.svg"/>航点任务文件：</li>
        </el-col>
        <el-col :span="14"  tag="ul">
          <li class="info-text">安防例行巡检</li>
          <li class="info-text">检查厂区有无安全隐患。</li>
          <li class="info-text interval">2018/11/1   11:21</li>
          <li class="info-text">每周</li>
          <li class="info-text">2018/7/27  12:00:53</li>
          <li class="info-text"><el-button type="primary" icon="el-icon-download">下载</el-button></li>
        </el-col>
      </el-col>
      <el-col :md="10" :lg="13" :xl="16">
        <div class="maps">
          <img src="../../../assets/images/task/test.png" alt=""/>
        </div>
      </el-col>
    </el-row>
  </el-main>
</template>

<script>
  export default {
    data() {
      return {
        activeIndex:'1',
        tableTest:[
          {time:'2018/11/7  12:00:53'},
          {time:'2018/11/7  12:00:53'}
        ]
      }
    },
    methods: {
      cells(cells) {
        return cells.columnIndex === 3 && 'border-left: 1px solid #e4eaef;';
      },
      hCells(cells) {
        return 'font-weight:normal;' + (cells.columnIndex === 3 ? 'border-left: 1px solid #e4eaef;' : '');
      }
    }
  }
</script>

<style scoped>
  .content {
    width: 100%;
    height: 100%;
    overflow-y: auto;
    padding: 0 0 0 10px;
  }
  .content .header {
    line-height: 60px;
    padding-top: 10px;
    border-bottom: 1px solid #e4eaef;
  }
  .content .header img {
    width: 36px;
    height: 36px;
    padding-right: 10px;
  }
  .content .infos {
    padding: 10px 5px;
    border-bottom: 1px solid #e4eaef;
  }

  .content .info-text,
  .content .info-title {
    position: relative;
    height: 55px;
    line-height: 55px;
  }
  .content .info-title {
    padding-left: 40px;
    white-space: nowrap;
  }
  .content .info-title img {
    position: absolute;
    top: 50%;
    left: 0;
    -webkit-transform: translateY(-50%);
    -moz-transform: translateY(-50%);
    -ms-transform: translateY(-50%);
    -o-transform: translateY(-50%);
    transform: translateY(-50%);
    width: 30px;
    height: 30px;
  }

  .content .infos .maps {
    width: 100%;
    height: 100%;
    border-radius: 10px;
  }
  .flip-mask {
    z-index: 9999;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    text-align: center;
    background-color: #0008;
  }
  .flip-mask:after {
    content: "";
    display: inline-block;
    height: 100%;
    width: 0;
    vertical-align: middle;
  }
  .flip-wrapper {
    width: 400px;
    background-color: #fff;
    border: 1px solid #f1a940;
    font-size: 18px;
    box-shadow: 0 2px 12px 0 #0001;
    backface-visibility: hidden;
  }
  .flip-wrapper .title {
    color: #333;
    height: 45px;
    line-height: 45px;
    background-color: #f1a940;
    padding-left: 20px;
    font-size: 20px;
    font-weight: 500;
  }
  .flip-wrapper .close {
    top: 0;
    right: 0;
    bottom: 0;
    line-height: 45px;
    padding: 0 10px;
    transition: color .3s linear;
  }
  .flip-wrapper .close:hover {color: #fff;}
  .flip-wrapper .content {
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
    padding: 5px 15px 20px;
  }
  .flip-wrapper .head {
    color: #333;
    border-bottom: 1px solid #e4eaef;
  }
  .flip-wrapper .head > img {
    width: 65px;
    height: 65px;
    padding-top: 10px;
  }
  .flip-wrapper .head > p {
    padding: 10px 0;
    white-space: nowrap;
  }
  .flip-wrapper .body {
    padding: 10px 0;
    border-bottom: 1px solid #e4eaef;
  }
  .flip-wrapper .body li,
  .flip-wrapper .body li .w-item{
    position: relative;
    font-size: 16px;
    height: 30px;
    line-height: 30px;
  }
  .flip-wrapper .body li.weather {height: 95px;}
  .flip-wrapper .body li.label {padding-left: 40px;}
  .flip-wrapper .body li.label > img {
    position: absolute;
    top: 0;
    left: 4px;
    width: 30px;
    height: 30px;
  }
  .flip-wrapper .body li .icon {
    position: absolute;
    top: 50%;
    right: 0;
    color: #42a847;
    font-size: 24px;
    -webkit-transform: translateY(-50%);
    -moz-transform: translateY(-50%);
    -ms-transform: translateY(-50%);
    -o-transform: translateY(-50%);
    transform: translateY(-50%);
  }
  .flip-wrapper .foot {padding-top: 20px;}
  .flip-wrapper .foot .status {
    height: 36px;
    line-height: 36px;
  }
  .flip-wrapper .foot .status .icon {
    font-size: 34px;
    color: #42a847;
    padding-right: 15px;
    -webkit-transform: translateY(15%);
    -moz-transform: translateY(15%);
    -ms-transform: translateY(15%);
    -o-transform: translateY(15%);
    transform: translateY(15%);
  }
  .flip-wrapper .foot-btns {margin-top: 18px;}
</style>
