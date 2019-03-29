<template>
  <el-main class="content">
    <el-header class="header font-24">
      <img src="../../../assets/images/task/t_view.svg"/>{{ $t('plan.view.title') }}
      <div class="f-r font-16">
        <el-button @click.prevent="addTask" type="primary" icon="el-icon-plus">{{ $t('plan.edit.add') }}</el-button>
        <el-button @click.prevent="editTask" type="warning" icon="el-icon-edit">{{ $t('plan.edit.alter') }}</el-button>
        <el-button @click.prevent="flyCheck" type="danger" icon="el-icon-refresh">{{ $t('plan.view.run') }}</el-button>
      </div>
    </el-header>
    <el-row type="flex" class="infos" tag="section">
      <el-col tag="ul">
        <li class="info-item d-f">
          <p class="label"><img src="../../../assets/images/task/t_info.svg"/>{{ $t('plan.plan_name') }}：</p>
          <p class="text">{{ $store.state.planInfo.name }}</p>
        </li>
        <li class="info-item d-f des">
          <p class="label">{{ $t('plan.plan_desc') }}：</p>
          <p class="text">{{ $store.state.planInfo.description?$store.state.planInfo.description:$t('plan.plan_desc_no') }}</p>
        </li>
        <li class="info-item d-f">
          <p class="label"><img src="../../../assets/images/task/t_time.svg"/>{{ $t('plan.plan_createtime') }}：</p>
          <p class="text">{{ timeDeal($store.state.planInfo.created_at) }}</p>
        </li>
        <li class="info-item d-f">
          <p class="label"><img src="../../../assets/images/task/t_drone.svg"/>{{ $t('plan.plan_air') }}：</p>
          <p class="text">{{ airDepot($store.state.planInfo.node_id,'air') }}</p>
        </li>
        <li class="info-item d-f">
          <p class="label"><img src="../../../assets/images/task/t_airport.svg"/>{{ $t('plan.plan_depot') }}：</p>
          <p class="text">{{ airDepot($store.state.planInfo.node_id,'depot') }}</p>
        </li>
        <li class="info-item d-f">
          <p class="label"><img src="../../../assets/images/task/t_frequency.svg"/>{{ $t('plan.plan_cycle') }}：</p>
          <p class="text">{{ cycleTypes($store.state.planInfo.cycle_types_id) }}</p>
        </li>
        <li class="info-item d-f">
          <p class="label"><img src="../../../assets/images/task/t_first.svg"/>{{ $t('plan.plan_first_time') }}：</p>
          <p class="text">{{ $store.state.planInfo.start_time?timeDeal($store.state.planInfo.start_time):$t('common.none') }}</p>
        </li>
        <li class="info-item d-f file">
          <p class="label"><img src="../../../assets/images/task/t_file.svg"/>{{ $t('plan.plan_mapfile') }}：</p>
          <p class="text">
            <el-button type="primary" icon="el-icon-download" :disabled="!$store.state.planInfo.map_path" @click="downloadPlanFile">
              {{ $t('common.download') }}
            </el-button>
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
      <img src="../../../assets/images/task/t_history.svg"/>{{ $t('plan.view.history') }}
    </el-header>
    <el-table
      :data="$store.state.planLogs"
      :cell-style="cells"
      :empty-text="$t('common.data_none')"
      :header-row-style="{'font-size':'18px'}"
      :header-cell-style="hCells">
      <el-table-column align="center" prop="created_at" :label="$t('plan.view.run_time')"></el-table-column>
      <el-table-column align="center" :label="$t('plan.view.raw_data')">
        <template slot-scope="scope">
          <el-button type="primary" :disabled="!scope.row.raw_data" @click="downloadFile(scope.row.raw_data, 'raw_data')">{{ $t('common.view') }}</el-button>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('plan.view.auto_run')">
        <template slot-scope="scope">
          <el-button type="primary" :disabled="!scope.row.orthomosaic_path" @click="downloadFile(scope.row.orthomosaic_path, 'orthomosaic.tif')">{{ $t('common.view') }}</el-button>
        </template>
      </el-table-column>
      <el-table-column align="center" border :label="$t('plan.view.logs')">
        <template slot-scope="scope">
          <el-button icon="el-icon-download" :disabled="!scope.row.air_log_path" @click="downloadFile(scope.row.air_log_path, 'air_log.bin')">{{ $t('common.download') }}</el-button>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('plan.view.sever_logs')">
        <template slot-scope="scope">
          <el-button icon="el-icon-download" :disabled="!scope.row.sever_log_path" @click="downloadFile(scope.row.sever_log_path, 'sever_log.bin')">{{ $t('common.download') }}</el-button>
        </template>
      </el-table-column>
    </el-table>
    <section v-if="showCheck" class="flip-mask pos-f">
      <section class="flip-wrapper d-ib va-m over-h text-l">
        <h4 class="pos-r title">{{ $t('plan.fly_check') }}<a class="pos-a close el-icon-close" @click.prevent="cancelRunPlan" href="javascript:;"></a></h4>
        <div class="content">
          <div class="head text-c">
            <img src="../../../assets/images/task/t_flip_check.svg"/>
            <p class="font-16">{{ $t('plan.fly_check_desc') }}</p>
          </div>
          <el-row class="body" type="flex" tag="div">
            <el-col :span="8" tag="ul">
              <li class="label weather"><img src="../../../assets/images/task/t_weather.svg"/>{{ $t('plan.weather') }}</li>
              <li class="label"><img src="../../../assets/images/task/t_drone.svg"/>{{ $t('common.air') }}</li>
              <li class="label"><img src="../../../assets/images/task/t_airport.svg"/>{{ $t('common.depot') }}</li>
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
            <p class="status text-c"><i class="icon el-icon-circle-check"></i>{{ $t('common.fly_yes') }}</p>
            <div class="foot-btns clear">
              <el-button class="f-l" @click.prevent="runPlan" type="danger">{{ $t('plan.start_now') }}</el-button>
              <el-button class="f-r" @click.prevent="cancelRunPlan">{{ $t('common.cancel') }}</el-button>
            </div>
          </div>
        </div>
      </section>
    </section>
  </el-main>
</template>

<script>
  import contentDisposition from 'content-disposition';
  import uactrack from '../../../components/uavtrack'
  export default {
    data() {
      return {
        showCheck:false
      }
    },
    mounted() {

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
      editTask(){this.$store.commit('planLink','edit')},
      addTask(){this.$store.commit('planLink','add');},
      timeDeal(time) {
        return this.$utils.timeFomart('YYYY/MM/DD hh:mm:ss',Date.parse(time));
      },
      cycleTypes(id) {
        switch(+id){
          case 0:return this.$t('plan.edit.cycle_type_1');
          case 1:return this.$t('plan.edit.cycle_type_2');
          case 2:return this.$t('plan.edit.cycle_type_3');
          case 3:return this.$t('plan.edit.cycle_type_4');
          case 4:return this.$t('plan.edit.cycle_type_5');
          case 5:return this.$t('plan.edit.cycle_type_6');
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
        return name!==''?name:this.$t('common.none');
      },
      // 打开飞行检查
      flyCheck() {this.showCheck = true;},
      // 取消执行
      cancelRunPlan() {this.showCheck = false;},
      // 确认执行
      runPlan() {
        let url = this.$store.state.config.suffix!==''?`${this.$store.state.api.local.plans}/${this.$store.state.planInfo.id}/plan_logs`+this.$store.state.config.suffix:`${this.$store.state.api.local.plans}/${this.$store.state.planInfo.id}/plan_logs`;
        this.$http.post(url)
          .then(res => {
            if (res.status === 200) {
              this.showCheck = false;
              this.$message({
                message:this.$t('plan.view.start_run'),
                type:'success'
              });
            }
          })
          .catch(err => {
            console.log(err);
          });
      },
      downloadPlanFile() {
        this.$store.dispatch('downloadPlanFile');
      },
      downloadFile(path, name) {
        this.$http.get(this.$store.state.config.server + path, {
          headers: { Authorization: this.$store.state.token },
          responseType: 'blob'
        }).then(res => {
          const url = URL.createObjectURL(res.data);
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          a.download = name;
          try {
            a.download = contentDisposition.parse(res.headers['Content-Disposition']).parameters.filename;
          } catch (e) { /* ignore */ }
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
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
