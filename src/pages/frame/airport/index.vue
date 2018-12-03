<template>
  <section class="wrapper">
    <el-row class="head">
      <el-col class="monitor">
        <el-header class="header font-24">
          <img src="../../../assets/images/airport/a_monitor.svg"/>实时监控
        </el-header>
        <section class="video">

        </section>
      </el-col>
      <el-col class="other">
        <section class="weather">
          <el-header class="header font-24">
            <img src="../../../assets/images/airport/a_weather.svg"/>室外天气
          </el-header>
          <section class="w-info">
            <i class="status d-b el-icon-success"></i>
            <div class="items d-f">
              <p>天气良好</p>
              <p>晴天</p>
              <p>风速 19km/h</p>
            </div>
            <div class="items d-f">
              <p>可以起飞</p>
              <p>气温 29℃</p>
              <p>湿度 52.9%</p>
            </div>
            <div class="chart">
              <p>未来1小时内不会有雨</p>
              <div class="chart-view">
                统计图...
              </div>
            </div>
          </section>
        </section>
        <section class="infos">
          <el-header class="header font-24">
            <img src="../../../assets/images/airport/a_infos.svg"/>机场信息
          </el-header>
          <table class="info-tab">
            <tr>
              <td class="id-num">编号</td>
              <td>A009</td>
              <td>
                <el-button class="font-16" type="primary">查看历史监控</el-button>
              </td>
              <td>
                <el-button class="font-16" type="primary">查看飞行任务</el-button>
              </td>
            </tr>
          </table>
        </section>
      </el-col>
    </el-row>
    <section class="control">
      <el-header class="header font-24">
        <img src="../../../assets/images/airport/a_control.svg"/>控制
      </el-header>
      <el-row>
        <el-col :span="12" class="control-left">
          <el-col :span="5" class="battery text-c">
            <img src="../../../assets/images/airport/a_battery.svg"/>
            <p>A仓电池</p>
          </el-col>
          <el-col :span="19" class="infos" tag="ul">
            <li class="d-f">
              <div class="item-label">循环次数</div>
              <div class="item-text">
                <span>100</span>
                <span>状态正常</span>
              </div>
            </li>
            <li class="d-f">
              <div class="item-label">状态</div>
              <div class="item-text status">
                <el-progress :text-inside="true" :stroke-width="20" :percentage="100" status="success"></el-progress>
              </div>
            </li>
            <li class="d-f">
              <div class="item-label">维护</div>
              <div class="item-text pos-r">
                <img class="pos-a" src="../../../assets/images/airport/a_maintain.svg"/>
                <el-button class="font-16" type="danger">放入电池</el-button>
                <el-button class="font-16" type="danger">取下电池</el-button>
              </div>
            </li>
            <li class="d-f">
              <div class="item-label">调试命令</div>
              <div class="item-text debug pos-r">
                <img class="pos-a" src="../../../assets/images/airport/a_charging.svg"/>
                <el-button class="font-16" type="warning">开始充电</el-button>
                <el-button class="font-16" type="warning">停止充电</el-button>
              </div>
            </li>
          </el-col>
        </el-col>
        <el-col :span="12">
          <el-col :span="5" class="battery text-c">
            <img src="../../../assets/images/airport/a_battery.svg"/>
            <p>B仓电池</p>
          </el-col>
          <el-col :span="19" class="infos" tag="ul">
            <li class="d-f">
              <div class="item-label">循环次数</div>
              <div class="item-text">
                <span>100</span>
                <span>状态正常</span>
              </div>
            </li>
            <li class="d-f">
              <div class="item-label">状态</div>
              <div class="item-text status">
                <el-progress :text-inside="true" :stroke-width="20" :percentage="100" status="success"></el-progress>
              </div>
            </li>
            <li class="d-f">
              <div class="item-label">维护</div>
              <div class="item-text pos-r">
                <img class="pos-a" src="../../../assets/images/airport/a_maintain.svg"/>
                <el-button class="font-16" type="danger">放入电池</el-button>
                <el-button class="font-16" type="danger">取下电池</el-button>
              </div>
            </li>
            <li class="d-f">
              <div class="item-label">调试命令</div>
              <div class="item-text debug pos-r">
                <img class="pos-a" src="../../../assets/images/airport/a_charging.svg"/>
                <el-button class="font-16" type="warning">开始充电</el-button>
                <el-button class="font-16" type="warning">停止充电</el-button>
              </div>
            </li>
          </el-col>
        </el-col>
      </el-row>
    </section>
    <section class="control high">
      <el-header class="header font-24">
        <img src="../../../assets/images/airport/a_h_control.svg"/>高级控制
      </el-header>
      <el-row type="flex" class="high-content">
        <el-col tag="ul" class="status">
          <li class="font-18">状态：</li>
          <li>
            <img src="../../../assets/images/airport/a_airport.svg"/>
            <el-button class="font-16" type="primary">机场状态</el-button>
          </li>
          <li>
            <img src="../../../assets/images/airport/a_drone.svg"/>
            <el-button class="font-16" type="primary">无人机状态</el-button>
          </li>
        </el-col>
        <el-col tag="table" class="operate">
          <tr>
            <td class="font-18">电机运动</td>
            <td class="text-c"><img src="../../../assets/images/airport/a_airport.svg"/></td>
            <td class="text-c"><img src="../../../assets/images/airport/a_charge.svg"/></td>
            <td class="text-c"><img src="../../../assets/images/airport/a_fixed.svg"/></td>
            <td class="text-c"><img src="../../../assets/images/airport/a_get.svg"/></td>
            <td class="text-c"><img src="../../../assets/images/airport/a_reset.svg"/></td>
          </tr>
          <tr class="btns">
            <td><el-button class="d-b font-16" type="danger">==急停==</el-button></td>
            <td>
              <el-button class="d-b font-16" type="warning">打开舱门</el-button>
              <el-button class="d-b font-16" type="warning">关闭舱门</el-button>
            </td>
            <td>
              <el-button class="d-b font-16" type="warning">开始充电</el-button>
              <el-button class="d-b font-16" type="warning">停止充电</el-button>
            </td>
            <td>
              <el-button class="d-b font-16" type="warning">固定无人机</el-button>
              <el-button class="d-b font-16" type="warning">松开无人机</el-button>
            </td>
            <td>
              <el-button class="d-b font-16" type="warning">取下飞机电池</el-button>
              <el-button class="d-b font-16" type="warning">安装飞机电池</el-button>
            </td>
            <td><el-button class="d-b font-16" type="warning">复位</el-button></td>
          </tr>
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
        <el-button class="font-16" type="danger">平台升顶</el-button>
        <el-button class="font-16" type="danger">平台降底</el-button>
        <el-button class="font-16" type="danger">平台举平</el-button>
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
        activeIndex:'1'
      }
    },
    components: {

    },
    methods: {

    }
  }
</script>

<style scoped>
  .head {
    width: 100%;
    height: 520px;
    border-bottom: 1px solid #e4eaef;
  }
  .header {
    line-height: 60px;
    padding: 0 10px;
    border-bottom: 1px solid #e4eaef;
  }
  .header img {
    width: 35px;
    height: 35px;
    padding-right: 10px;
  }
  .monitor {
    width: 640px;
    border-right: 1px solid #e4eaef;
  }
  .monitor .header{padding: 0 20px;}
  .other {
    width: calc(100% - 640px);
    height: 100%;
  }
  .weather {
    padding: 0 15px;
    border-bottom: 1px solid #e4eaef;
  }
  .infos {padding: 0 15px;}
  .video {
    width: 100%;
    height: 460px;
    background-color: #eee;
  }
  .weather .w-info .status {
    color: #42a847;
    font-size: 68px;
    margin: 15px 0;
  }
  .weather .w-info .items {margin: 10px 0;}
  .weather .w-info .items p {width: calc(100% / 3);}
  .weather .w-info .chart {margin-top: 20px;}
  .weather .w-info .chart-view {
    width: 360px;
    height: 120px;
    margin: 15px 0;
    background-color: #eee;
  }
  .infos .info-tab{width: 100%;}
  .infos .info-tab td {
    white-space: nowrap;
    padding: 10px 0;
    text-align: center;
  }
  .infos .info-tab td.id-num {width: 10%;}

  .control {
    padding: 0 15px;
    border-bottom: 1px solid #e4eaef;
  }
  .control .battery {padding: 20px 0;}
  .control .infos {padding: 16px 0;}
  .control .control-left {border-right: 1px solid #e4eaef;}
  .control .battery img{
    width: 75px;
    height: 75px;
    margin-bottom: 10px;
  }
  .control .item-label {width: 80px;}
  .control .item-text {min-height: 30px;}
  .control .item-text span:last-child {padding-left: 5px;}
  .control .item-text img {
    left: 5px;
    top: 50%;
    width: 40px;
    height: 40px;
    -webkit-transform: translateY(-50%);
    -moz-transform: translateY(-50%);
    -ms-transform: translateY(-50%);
    -o-transform: translateY(-50%);
    transform: translateY(-50%);
  }
  .control .item-text.pos-r {
    height: 45px;
    padding-left: 64px;
  }
  .control .item-text.debug {margin-top: 20px;}
  .control .item-text.debug:before {
    content: '';
    position: absolute;
    top: -10px;
    left: 0;
    right: 0;
    height: 1px;
    background-color: #e4eaef;
  }
  .control .item-text.status {
    width: 290px;
    height: 20px;
  }
  .control.high {padding-bottom: 15px;border-bottom: 0;}
  .control.high .high-content {padding-top: 15px;}
  .control.high .status {
    width: 200px;
    border-right: 1px solid #e4eaef;
  }
  .control.high .operate tr:first-child,
  .control.high .status li {
    height: 52px;
    line-height: 52px;
  }
  .control.high .status li button {width: 120px;}
  .control.high .status img{
    width: 40px;
    height: 40px;
    padding-right: 10px;
  }
  .control.high .operate {
    width: calc(100% - 200px);
    margin-left: 20px;
  }
  .control.high .status li:first-child,
  .control.high .operate tr:first-child td{padding-bottom: 10px;}
  .control.high .operate td {
    width: calc(100% / 6);
  }
  .control.high .operate td img {
    width: 40px;
    height: 40px;
  }
  .control.high .operate .btns td button{
    width: 120px;
    height: 45px;
    padding: 0;
    margin: 0 auto;
  }
  .control.high .operate .btns td button:first-child {margin-bottom: 10px;}
  .control.high .operate .btns td:last-child button,
  .control.high .operate .btns td:first-child button {
    width: 115px;
    height: 100px;
  }
  .control.high .operate .btns td:first-child button{margin: 0;}
  .control.high .operate .btns td:last-child button {margin: 0 auto;}

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
