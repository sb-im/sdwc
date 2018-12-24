<template>
  <section class="battery">
    <el-header class="header font-24">
      <img src="../../assets/images/airport/a_control.svg"/>控制
    </el-header>
    <el-row>
      <el-col :span="12" class="bat-left">
        <el-col :span="5" class="bat-box text-c">
          <img src="../../assets/images/airport/a_battery.svg"/>
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
              <img class="pos-a" src="../../assets/images/airport/a_maintain.svg"/>
              <el-button class="font-16" @click.prevent="doMsission('pickabattery')" type="danger">放入电池</el-button>
              <el-button class="font-16" @click.prevent="doMsission('mountabattery')" type="danger">取下电池</el-button>
            </div>
          </li>
          <li class="d-f">
            <div class="item-label">调试命令</div>
            <div class="item-text debug pos-r">
              <img class="pos-a" src="../../assets/images/airport/a_charging.svg"/>
              <el-button class="font-16" @click.prevent="doMsission('pickbbattery')" type="warning">开始充电</el-button>
              <el-button class="font-16" @click.prevent="doMsission('pickbbattery')" type="warning">停止充电</el-button>
            </div>
          </li>
        </el-col>
      </el-col>
      <el-col :span="12">
        <el-col :span="5" class="bat-box text-c">
          <img src="../../assets/images/airport/a_battery.svg"/>
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
              <img class="pos-a" src="../../assets/images/airport/a_maintain.svg"/>
              <el-button class="font-16" @click.prevent="doMsission('pickbbattery')" type="danger">放入电池</el-button>
              <el-button class="font-16" @click.prevent="doMsission('mountbbattery')" type="danger">取下电池</el-button>
            </div>
          </li>
          <li class="d-f">
            <div class="item-label">调试命令</div>
            <div class="item-text debug pos-r">
              <img class="pos-a" src="../../assets/images/airport/a_charging.svg"/>
              <el-button class="font-16" @click.prevent="doMsission('pickbbattery')" type="warning">开始充电</el-button>
              <el-button class="font-16" @click.prevent="doMsission('pickbbattery')" type="warning">停止充电</el-button>
            </div>
          </li>
        </el-col>
      </el-col>
    </el-row>
  </section>
</template>

<script>
  import Qs from 'qs'
  export default {
    name: "Battery",
    props: {
      node:{
        type:Object,
        required: true,
        default: () => {}
      }
    },
    methods: {
      doMsission(name) {
        this.sendMission(name,() => {
          this.$message({
            message: '操作成功！',
            type: 'success'
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
  .battery {
    border-bottom: 1px solid #e4eaef;
  }
  .battery .bat-box {padding: 20px 0;}
  .battery .infos {padding: 16px 0;}
  .battery .bat-left {border-right: 1px solid #e4eaef;}
  .battery .bat-box img{
    width: 75px;
    height: 75px;
    margin-bottom: 10px;
  }
  .battery .item-label {width: 80px;}
  .battery .item-text {min-height: 30px;}
  .battery .item-text span:last-child {padding-left: 5px;}
  .battery .item-text img {
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
  .battery .item-text.pos-r {
    height: 45px;
    padding-left: 64px;
  }
  .battery .item-text.debug {margin-top: 20px;}
  .battery .item-text.debug:before {
    content: '';
    position: absolute;
    top: -10px;
    left: 0;
    right: 0;
    height: 1px;
    background-color: #e4eaef;
  }
  .battery .item-text.status {
    width: 290px;
    height: 20px;
  }
</style>
