<template>
  <section class="control">
    <el-header class="header font-24">
      <img src="../../assets/images/drone/d_control.svg"/>高级控制
    </el-header>
    <el-row type="flex" class="high-content">
      <el-col tag="ul" class="status">
        <li class="font-18">状态：</li>
        <li>
          <img src="../../assets/images/drone/d_drone.svg"/>
          <el-button class="font-16" @click="seeStatus('air')" type="primary">无人机状态</el-button>
        </li>
        <li>
          <img src="../../assets/images/drone/d_airport.svg"/>
          <el-button class="font-16" @click="seeStatus('depot')" type="primary">机场状态</el-button>
        </li>
      </el-col>
      <el-col class="operate">
        <ul class="d-f">
          <li class="font-18">无人机控制</li>
          <li class="text-c"><img src="../../assets/images/drone/d_fly.svg"/></li>
          <li class="text-c"><img src="../../assets/images/drone/d_return.svg"/></li>
          <li class="text-c"><img src="../../assets/images/drone/d_task.svg"/></li>
          <li class="text-c"><img src="../../assets/images/drone/d_updown.svg"/></li>
          <li class="text-c"><img src="../../assets/images/drone/d_spare.svg"/></li>
        </ul>
        <ul class="d-f btns">
          <li><el-button @click.prevent="doMsission('mode_loiter')" class="d-b font-16" type="danger">==悬停==</el-button></li>
          <li><el-button @click.prevent="doMsission('take_off')" class="d-b font-16" type="danger">起飞</el-button></li>
          <li><el-button @click.prevent="doMsission('model_rtl')" class="d-b font-16" type="danger">返航</el-button></li>
          <li><el-button @click.prevent="readyMsission" class="d-b font-16" type="danger">开始任务</el-button></li>
          <li>
            <el-button @click.prevent="doMsission('up_5')" class="d-b font-16" type="danger">上升5米</el-button>
            <el-button @click.prevent="doMsission('down_5')" class="d-b font-16" type="danger">下降5米</el-button>
          </li>
          <li><el-button @click.prevent="doMsission('land_bakup')" class="d-b font-16" type="danger">降落到备用点</el-button></li>
        </ul>
      </el-col>
    </el-row>
    <section class="logs">
      <header class="header font-18">日志：</header>
      <ul class="logs-content">
        <li v-for="(val,index) in airLogs" :key="index">{{ val }}</li>
        <li v-for="(val,index) in depotLogs" :key="index">{{ val }}</li>
      </ul>
    </section>
    <el-collapse class="debug">
      <el-collapse-item title="以下命令仅限开发人员调试使用" name="1">
        <el-button class="font-16" @click.prevent="doMsission('land')" type="danger">直接降落</el-button>
        <span class="font-14">桨叶急停，需特别小心--></span>
        <el-button class="font-16" @click.prevent="doMsission('emergency_stop')" type="danger">急停</el-button>
        <div class="btns f-r">
          <el-input class="f-l inp"></el-input>
          <el-button class="f-l font-16" type="danger">发送</el-button>
          <el-button class="f-l font-16">清空</el-button>
        </div>
      </el-collapse-item>
    </el-collapse>
  </section>
</template>

<script>
  import Qs from 'qs'
  export default {
    name: "AirTerminal",
    data() {
      return {
        airLogs:[],
        depotLogs:[]
      }
    },
    props: {
      node:{
        type:Object,
        required: true,
        default: () => {}
      }
    },
    mounted() {

    },
    methods: {
      seeStatus(type) {
        switch (type) {
          case 'air':this.$store.state.statusLive && this.airLogs.push(this.$store.state.statusLive.payload);break;
          case 'depot':this.$store.state.statusLive && this.depotLogs.push(this.$store.state.statusLive.payload);break;
        }
        console.log(this.airLogs,this.depotLogs);
      },
      doMsission(name) {
        this.sendMission(name,() => {
          this.$message({
            message: '操作成功！',
            type: 'success'
          });
        });
      },
      readyMsission() {
        this.sendMission('startmission_ready',() => {
          this.$confirm('任务准备就绪，是否继续?', '系统提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            this.sendMission('startmission',() => {
              this.$message({
                message: '操作成功！',
                type: 'success'
              });
            });
          });
        });
      },
      sendMission(name,callback) {
        this.$http.post(`${this.$store.state.api.nodes}/${this.node.id}/mission_queues`,Qs.stringify({
          name:name,
          level:0,
          mission_queues_id:0
        }))
          .then(res => {
            if (res.status === 200) {
              callback && callback();
            } else this.$message.error('操作失败！');
          })
          .catch(err => {
            this.$message.error('操作失败！');
            console.log(err);
          });
      }
    }
  }
</script>

<style scoped>
  .header {border-bottom: 1px solid #e4eaef;}
  .header img{
    width: 30px;
    height: 30px;
    padding-right: 8px;
  }
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
  .debug .btns > .inp{
    width: auto;
    margin-right: 10px;
  }
</style>
