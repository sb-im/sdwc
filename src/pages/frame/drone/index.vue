<template>
  <section class="wrapper">
    <section class="head font-14">
      <el-header height="45px" class="header">
        <img src="../../../assets/images/drone/d_tname.svg"/>安防例行巡检
        <ul class="f-r d-f">
          <li><img src="../../../assets/images/drone/d_mode.svg"/>自动模式</li>
          <li><img src="../../../assets/images/drone/d_time.svg"/>已飞行4分钟</li>
          <li><img src="../../../assets/images/drone/d_electricity.svg"/>剩余电量72%</li>
          <li><img src="../../../assets/images/drone/d_voltage.svg"/>电压24.12V</li>
          <li><img src="../../../assets/images/drone/d_speed.svg"/>速度5 m/s</li>
          <li><img src="../../../assets/images/drone/d_height.svg"/>高度23 m</li>
          <li><img src="../../../assets/images/drone/d_satellite.svg"/>14卫星 RTK FIXED</li>
        </ul>
      </el-header>
      <el-row class="map-video">
        <el-col class="left"></el-col>
        <el-col class="right">
          <div class="maps"></div>
          <div class="pitch">
            <div class="pitch-slider d-f">
              <p class="label font-16">云台俯仰角</p><el-slider class="slider"></el-slider>
            </div>
            <div class="btns">
              <el-button type="primary" class="font-16">截图</el-button>
              <el-button type="primary" class="font-16">录制屏幕</el-button>
            </div>
          </div>
        </el-col>
      </el-row>
    </section>
    <section class="control">
      <el-header class="header font-24">
        <img src="../../../assets/images/drone/d_control.svg"/>高级控制
      </el-header>
      <el-row type="flex" class="high-content">
        <el-col tag="ul" class="status">
          <li class="font-18">状态：</li>

          <li>
            <img src="../../../assets/images/drone/d_drone.svg"/>
            <el-button class="font-16" type="primary">无人机状态</el-button>
          </li>
          <li>
            <img src="../../../assets/images/drone/d_airport.svg"/>
            <el-button class="font-16" type="primary">机场状态</el-button>
          </li>
        </el-col>
        <el-col class="operate">
          <ul class="d-f">
            <li class="font-18">无人机控制</li>
            <li class="text-c"><img src="../../../assets/images/drone/d_fly.svg"/></li>
            <li class="text-c"><img src="../../../assets/images/drone/d_return.svg"/></li>
            <li class="text-c"><img src="../../../assets/images/drone/d_task.svg"/></li>
            <li class="text-c"><img src="../../../assets/images/drone/d_updown.svg"/></li>
            <li class="text-c"><img src="../../../assets/images/drone/d_spare.svg"/></li>
          </ul>
          <ul class="d-f btns">
            <li><el-button class="d-b font-16" type="danger">==悬停==</el-button></li>
            <li><el-button class="d-b font-16" type="danger">起飞</el-button></li>
            <li><el-button class="d-b font-16" type="danger">返航</el-button></li>
            <li><el-button class="d-b font-16" type="danger">开始任务</el-button></li>
            <li>
              <el-button class="d-b font-16" type="danger">上升5米</el-button>
              <el-button class="d-b font-16" type="danger">下降5米</el-button>
            </li>
            <li><el-button class="d-b font-16" type="danger">降落到备用点</el-button></li>
          </ul>
        </el-col>
      </el-row>
      <section class="logs">
        <header class="header font-18">日志：</header>
        <ul class="logs-content">
          <li>AUTO> Mode AUTO</li>
        </ul>
      </section>
      <section class="debug">
        <p>以下命令仅限开发人员调试使用</p>
        <el-button class="font-16" type="danger">直接降落</el-button>
        <span class="font-14">桨叶急停，需特别小心--></span>
        <el-button class="font-16" type="danger">急停</el-button>
        <div class="btns f-r">
          <el-input class="f-l inp"></el-input>
          <el-button class="f-l font-16" type="danger">发送</el-button>
          <el-button class="f-l font-16">清空</el-button>
        </div>
      </section>
    </section>
  </section>
</template>

<script>

  export default {
    data() {
      return {
        activeIndex:'1',
        tableTest:[{
          id:'A007'
        }]
      }
    },
    components: {

    },
    methods: {

    }
  }
</script>

<style scoped>
  .head, .header {border-bottom: 1px solid #e4eaef;}
  .head > .header {
    padding: 0 10px;
    height: 45px;
    line-height: 45px;
  }
  .header img{
    width: 30px;
    height: 30px;
    padding-right: 8px;
  }
  .header li {padding-right: 12px;}
  .map-video .left {
    width: 750px;
    height: 428px;
    background-color: #eee;
    border-right: 1px solid #e4eaef;
  }
  .map-video .right {width: calc(100% - 750px);}
  .map-video .maps {
    width: 100%;
    height: 310px;
    background-color: #999;
  }
  .map-video .pitch {padding: 10px 28px;}
  .map-video .pitch-slider .label {
    height: 40px;
    line-height: 40px;
    width: 36%;
  }
  .map-video .pitch-slider .slider {width: 64%;}
  .map-video .right .btns{margin-top: 8px;}
  .map-video .right .btns button{width: 125px;}

  .control {
    padding: 0 15px 15px;
  }
  .control .header {
    padding: 0 10px;
    line-height: 60px;
  }
  .control .high-content {padding-top: 15px;}
  .control .status {
    width: 200px;
    border-right: 1px solid #e4eaef;
  }
  .control .operate ul:first-child,
  .control .status li {
    height: 52px;
    line-height: 52px;
  }
  .control .status li button {width: 120px;}
  .control .status img{
    width: 40px;
    height: 40px;
    padding-right: 10px;
  }
  .control .operate {
    width: calc(100% - 200px);
    margin-left: 20px;
  }
  .control .status li:first-child,
  .control .operate ul:first-child{padding-bottom: 10px;}
  .control .operate li {
    width: calc(100% / 6);
  }
  .control .operate li img {
    width: 40px;
    height: 40px;
  }
  .control .operate .btns li button{
    width: 120px;
    height: 45px;
    padding: 0;
    margin: 0 auto;
  }
  .control .operate .btns li button:first-child {margin-bottom: 10px;}
  .control .operate .btns li:last-child button,
  .control .operate .btns li:first-child button {
    width: 115px;
    height: 100px;
  }
  .control .operate .btns li:first-child button{margin: 0;}
  .control.high .operate .btns li:last-child button {margin: 0 auto;}

  .logs > .header {
    border-bottom: 0;
    line-height: 46px;
    padding: 0;
  }
  .logs-content {
    width: 100%;
    height: 300px;
    padding: 5px;
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
    border: 1px solid #e4eaef;
    overflow-y: auto;
  }
  .logs-content li {
    line-height: 18px;
    color: #999;
  }
  .debug > p {
    position: relative;
    color: #999;
    margin-top: 10px;
    font-size: 14px;
    line-height: 26px;
  }
  .debug > p:before {
    content: '';
    position: absolute;
    top: 50%;
    right: 0;
    height: 1px;
    width: 81%;
    -webkit-transform: translateY(-50%);
    -moz-transform: translateY(-50%);
    -ms-transform: translateY(-50%);
    -o-transform: translateY(-50%);
    transform: translateY(-50%);
    background-color: #e4eaef
  }
  .debug .btns > .inp{
    width: auto;
    margin-right: 10px;
  }
</style>
