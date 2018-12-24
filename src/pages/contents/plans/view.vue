<template>
  <el-main class="content">
    <el-header class="header font-24">
      <img src="../../../assets/images/task/t_view.svg"/>查看任务
      <div class="f-r font-16">
        <el-button @click.prevent="addTask" type="primary" icon="el-icon-plus">新建任务</el-button>
        <el-button @click.prevent="editTask" type="warning" icon="el-icon-edit">修改任务</el-button>
        <el-button @click.prevent="flyCheck" type="danger" icon="el-icon-refresh">立即执行</el-button>
      </div>
    </el-header>
    <el-row type="flex" class="infos" tag="section">
      <el-col tag="ul">
        <li class="info-item d-f">
          <p class="label"><img src="../../../assets/images/task/t_info.svg"/>任务名称：</p>
          <p class="text">{{ $store.state.planInfo.name }}</p>
        </li>
        <li class="info-item d-f des">
          <p class="label">任务描述：</p>
          <p class="text">{{ $store.state.planInfo.description?$store.state.planInfo.description:'暂无任务描述' }}</p>
        </li>
        <li class="info-item d-f">
          <p class="label"><img src="../../../assets/images/task/t_time.svg"/>创建时间：</p>
          <p class="text">{{ timeDeal($store.state.planInfo.created_at) }}</p>
        </li>
        <li class="info-item d-f">
          <p class="label"><img src="../../../assets/images/task/t_drone.svg"/>执飞无人机：</p>
          <p class="text">{{ airDepot($store.state.planInfo.node_id,'air') }}</p>
        </li>
        <li class="info-item d-f">
          <p class="label"><img src="../../../assets/images/task/t_airport.svg"/>起降机场：</p>
          <p class="text">{{ airDepot($store.state.planInfo.node_id,'depot') }}</p>
        </li>
        <li class="info-item d-f">
          <p class="label"><img src="../../../assets/images/task/t_frequency.svg"/>执行频次：</p>
          <p class="text">{{ cycleTypes($store.state.planInfo.cycle_types_id) }}</p>
        </li>
        <li class="info-item d-f">
          <p class="label"><img src="../../../assets/images/task/t_first.svg"/>首次执行时间：</p>
          <p class="text">{{ $store.state.planInfo.start_time?timeDeal($store.state.planInfo.start_time):'暂无' }}</p>
        </li>
        <li class="info-item d-f file">
          <p class="label"><img src="../../../assets/images/task/t_file.svg"/>航点任务文件：</p>
          <p class="text">
            <a :href="$store.state.planInfo.map_path?$store.state.config.server+$store.state.planInfo.map_path:'javascript:;'" download class="el-button el-button--primary">
              <i class="el-icon-download"></i><span>下载</span>
            </a>
          </p>
        </li>
      </el-col>
      <el-col class="maps clear">
        <div class="f-r way-box">
          <uactrack v-if="$store.state.planMap.length!==0" :flight="$store.state.planMap"></uactrack>
        </div>
      </el-col>
    </el-row>

    <el-header class="header font-24">
      <img src="../../../assets/images/task/t_history.svg"/>任务执行历史
    </el-header>
    <el-table
      :data="$store.state.planLogs"
      :cell-style="cells"
      empty-text="暂无相关数据"
      :header-row-style="{'font-size':'18px'}"
      :header-cell-style="hCells">
      <el-table-column align="center" prop="created_at" label="执行时间"></el-table-column>
      <el-table-column align="center" label="原始数据">
        <template slot-scope="scope">
          <a href="javascript:;" class="font-16 el-button el-button--primary">查看</a>
        </template>
      </el-table-column>
      <el-table-column align="center" label="自动处理结果">
        <template slot-scope="scope">
          <a :href="scope.row.orthomosaic_path?$store.state.config.server+scope.row.orthomosaic_path:'javascript:;'" target="_blank" class="font-16 el-button el-button--primary">查看</a>
        </template>
      </el-table-column>
      <el-table-column align="center" border label="飞行日志">
        <template slot-scope="scope">
          <a :href="scope.row.air_log_path?$store.state.config.server+scope.row.air_log_path:'javascript:;'" download class="el-button">
            <i class="el-icon-download"></i><span>下载</span>
          </a>
        </template>
      </el-table-column>
      <el-table-column align="center" label="服务器日志">
        <template slot-scope="scope">
          <a href="javascript:;" download class="el-button">
            <i class="el-icon-download"></i><span>下载</span>
          </a>
        </template>
      </el-table-column>
    </el-table>
    <section v-if="showCheck" class="flip-mask pos-f">
      <section class="flip-wrapper d-ib va-m over-h text-l">
        <h4 class="pos-r title">飞行前检查<a class="pos-a close el-icon-close" @click.prevent="cancelRunPlan" href="javascript:;"></a></h4>
        <div class="content">
          <div class="head text-c">
            <img src="../../../assets/images/task/t_flip_check.svg"/>
            <p class="font-16">我们需要检查设备情况，确保可以安全执行任务。</p>
          </div>
          <el-row class="body" type="flex" tag="div">
            <el-col :span="8" tag="ul">
              <li class="label weather"><img src="../../../assets/images/task/t_weather.svg"/>天气</li>
              <li class="label"><img src="../../../assets/images/task/t_drone.svg"/>无人机</li>
              <li class="label"><img src="../../../assets/images/task/t_airport.svg"/>机场</li>
            </el-col>
            <el-col :span="16" tag="ul">
              <li class="weather">
                <p class="w-item">未来30分钟不会下雨<i class="icon el-icon-circle-check"></i></p>
                <p class="w-item">当前风速1 m/s<i class="icon el-icon-circle-check"></i></p>
                <p class="w-item">室外温度 32℃<i class="icon el-icon-circle-check"></i></p>
              </li>
              <li>剩余电量大于80%<i class="icon el-icon-circle-check"></i></li>
              <li>状态正常<i class="icon el-icon-circle-check"></i></li>
            </el-col>
          </el-row>
          <div class="foot">
            <p class="status text-c"><i class="icon el-icon-circle-check"></i>可以起飞</p>
            <div class="foot-btns clear">
              <el-button class="f-l" @click.prevent="runPlan" type="danger">立即启动</el-button>
              <el-button class="f-r" @click.prevent="cancelRunPlan">取消</el-button>
            </div>
          </div>
        </div>
      </section>
    </section>
  </el-main>
</template>

<script>
  import uactrack from '../../../components/uavtrack'
  export default {
    data() {
      return {
        showCheck:false
      }
    },
    mounted() {
      console.log(this.$store.state.planLogs)
    },
    components: {
      'uactrack':uactrack
    },
    methods: {
      cells(cells) {
        return cells.columnIndex === 3 && 'border-left: 1px solid #e4eaef;';
      },
      hCells(cells) {
        return 'font-weight:normal;' + (cells.columnIndex === 3 ? 'border-left: 1px solid #e4eaef;' : '');
      },
      editTask(){
        this.$store.commit('planLink','edit')
      },
      addTask(){
        this.$store.commit('planLink','add');
      },
      timeDeal(time) {
        return this.$utils.timeFomart('YYYY/MM/DD hh:mm:ss',Date.parse(time));
      },
      cycleTypes(id) {
        switch(+id){
          case 0:return '手动';
          case 1:return '一次';
          case 2:return '每小时';
          case 3:return '每天';
          case 4:return '每周';
          case 5:return '每月';
        }
      },
      airDepot(id,type) {
        let name = '';
        this.$store.state.nodes.forEach(val => {
          if(val.type_name === type && val.id === id){
            name = val.name;
            return true;
          }
        });
        return name!==''?name:'暂无';
      },
      // 打开飞行检查
      flyCheck() {this.showCheck = true;},
      // 取消执行
      cancelRunPlan() {this.showCheck = false;},
      // 确认执行
      runPlan() {
        this.$http.get(`${this.$store.state.api.plans}/${this.$store.state.planInfo.id}/plan_logs`)
          .then(res => {
            if (res.status === 200) {
              this.showCheck = false;
              this.$message({
                message:'当前任务开始执行！',
                type:'success'
              });
            }
          })
          .catch(err => {
            console.log(err);
          });
      },
      testEv(v) {
        console.log(v)
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
  .infos {
    padding: 10px 10px 10px 5px;
    border-bottom: 1px solid #e4eaef;
  }
  .info-item {
    min-height: 30px;
    line-height: 30px;
    padding: 8px 0;
  }
  .info-item .label {
    position: relative;
    padding-left: 40px;
    width: 32%;
    white-space: nowrap;
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
  }
  .info-item .label img {
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
  .info-item.des .text{min-height: 60px;}
  .info-item.file{
    height: 40px;
    line-height: 40px;
  }
  .info-item .text {width: 68%;}
  .infos .maps .way-box {
    width: 450px;
    height: 320px;
    background-color: #eee;
    border: 1px solid #e4eaef;
    border-radius: 10px;
    overflow: hidden;
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
