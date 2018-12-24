<template>
  <el-main class="content">
    <el-header class="header font-24">
      <img src="../../../assets/images/task/t_edit.svg"/>修改任务
      <div class="f-r font-16">
        <el-button @click.prevent="submitPlan" type="warning" icon="el-icon-document">保存任务</el-button>
        <el-button @click.prevent="deletePlan" type="danger" icon="el-icon-delete">删除任务</el-button>
        <el-button @click.prevent="backEvent" icon="el-icon-close">取消并返回</el-button>
      </div>
    </el-header>
    <el-row type="flex" class="edit" tag="section">
      <el-col class="edit-box" tag="ul">
        <li class="edit-item d-f">
          <p class="label"><img src="../../../assets/images/task/t_info.svg"/>任务名称：</p>
          <p class="text"><el-input v-model="planName" placeholder="输入任务名称"></el-input></p>
        </li>
        <li class="edit-item d-f des">
          <p class="label">任务描述：</p>
          <p class="text"><el-input v-model="planDesc" type="textarea" placeholder="输入任务描述"></el-input></p>
        </li>
        <li class="edit-item d-f">
          <p class="label"><img src="../../../assets/images/task/t_drone.svg"/>执飞无人机：</p>
          <p class="text">
            <el-select class="d-b" v-model="planNode" placeholder="选择执飞无人机">
              <el-option v-for="(val,index) in $store.state.nodes" v-if="val.type_name==='air'" :key="index" :label="val.name" :value="val.id"></el-option>
            </el-select>
          </p>
        </li>
        <li class="edit-item d-f">
          <p class="label"><img src="../../../assets/images/task/t_airport.svg"/>起降机场：</p>
          <p class="text">
            <el-select class="d-b" v-model="planDepot" placeholder="选择起降机场">
              <el-option v-for="(val,index) in $store.state.nodes" v-if="val.type_name==='depot'" :key="index" :label="val.name" :value="val.id"></el-option>
            </el-select>
          </p>
        </li>
        <li class="edit-item d-f">
          <p class="label"><img src="../../../assets/images/task/t_frequency.svg"/>执行频次：</p>
          <p class="text">
            <el-select class="d-b" v-model="planCycle" placeholder="选择执行频次">
              <el-option v-for="(val,index) in cycleTypes" :key="index" :label="val.name" :value="val.id"></el-option>
            </el-select>
          </p>
        </li>
        <li class="edit-item d-f">
          <p class="label"><img src="../../../assets/images/task/t_first.svg"/>首次执行时间：</p>
          <p class="text">
            <el-date-picker v-model="planStart" style="width: 100%" type="datetime" @change="startTime" placeholder="选择首次执行时间"></el-date-picker>
          </p>
        </li>
        <li class="edit-item d-f file">
          <p class="label"><img src="../../../assets/images/task/t_file.svg"/>航点任务文件：</p>
          <p class="text">
            <a :href="$store.state.planInfo.map_path?$store.state.config.server+$store.state.planInfo.map_path:'javascript:;'" download class="el-button el-button--primary">
              <i class="el-icon-download"></i><span>下载</span>
            </a>
            <a href="javascript:;" class="pos-r el-button el-button--primary">
              <i class="el-icon-upload"></i><span>重新上传</span>
              <input @change="mapFlie($event)" class="pos-a" name="file" type="file"/>
            </a>
          </p>
        </li>
      </el-col>
      <el-col class="maps clear">
        <div class="f-r way-box">
          <map-way v-if="showMap" :flight="pathResult"></map-way>
        </div>
      </el-col>
    </el-row>
  </el-main>
</template>

<script>
  import PaPaParse from 'papaparse'
  import MapWay from '../../../components/uavtrack'
  export default {
    data() {
      return {
        cycleTypes:[
          {id:0,name:'手动'},
          {id:1,name:'一次'},
          {id:2,name:'每小时'},
          {id:3,name:'每天'},
          {id:4,name:'每周'},
          {id:5,name:'每月'}
        ],
        planName: this.$store.state.planInfo.name,
        planDesc: this.$store.state.planInfo.description,
        planFile: '',
        planNode: this.$store.state.planInfo.node_id,
        planDepot: this.$store.state.planInfo.depot_id,
        planCycle: this.$store.state.planInfo.cycle_types_id,
        planStart: this.$store.state.planInfo.start_time,
        showMap: true,
        pathResult:this.$store.state.planMap
      }
    },
    components: {
      'map-way':MapWay
    },
    created() {

    },
    methods: {
      backEvent(){
        this.$store.commit('planLink','view');
      },
      mapFlie(ev) {
        this.planFile = ev.target.files[0];
        PaPaParse.parse(ev.target.files[0],{
          complete:res => {
            res.data.forEach(val=>{
              val[3]==='16' && this.pathResult.push({lat:(+val[8]),lng:(+val[9])});
            });
            this.showMap = this.pathResult.length!==0;
          }
        });
      },
      startTime(date) {
        this.planStart = Date.parse(date);
      },
      submitPlan() {
        if (this.planName!=='') {
          if (this.planNode!=='') {
            if (this.planDepot!=='') {
              if (this.planCycle!=='') {
                let form = new FormData();
                form.append('name',this.planName);
                form.append('description',this.planDesc);
                this.planFile && form.append('file',this.planFile);
                form.append('node_id',this.planNode);
                form.append('depot_id',this.planDepot);
                form.append('start_time',this.planStart);
                form.append('cycle_types_id',this.planCycle);
                this.$http.patch(`${this.$store.state.api.plans}/${this.$store.state.planInfo.id}`,form,{
                  headers: {'Content-Type': 'multipart/form-data'}
                })
                  .then(res => {
                    if(res.status===200 && typeof res.data === 'object') {
                      this.$store.commit("planSave", {data:res.data, _this:this});
                      this.$store.dispatch('getPlanInfo', {_this:this, id:res.data.id});
                    }
                  })
                  .catch(err => {
                    console.log(err);
                  });
              } else this.$message.error('请选择执行频次！');
            } else this.$message.error('请选择起降机场！');
          } else this.$message.error('请选择执飞无人机！');
        } else this.$message.error('请输入任务名称！');
      },
      deletePlan() {
        this.$confirm('此操作将删除该任务, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$http.delete(`${this.$store.state.api.plans}/${this.$store.state.planInfo.id}`)
            .then(res => {
              if (res.status===200) {
                let tmp = {type: 'plans', id: res.data.id};
                this.$store.commit('tabChange',this.tabActive(tmp.type+tmp.id,this.$store.state.active,this.$store.state.links));
                this.$store.commit("linkDel", tmp);
                this.$store.commit("planDel", tmp.id);
              }
            })
            .catch(err => {
              console.log(err);
            });
        });
      },
      tabActive(del,cur,links){
        if (del === cur) {
          del = {type: del.replace(/[^a-zA-z]+/ig, ''), id: del.replace(/[^0-9]/ig, '')};
          links.forEach((tab, index) => {
            if(tab.type === del.type && tab.item.id === (+del.id) ){
              let next = links[index + 1] || links [index - 1];
              cur = next ? next.type+next.item.id : cur;
              return true;
            }
          });
        }
        let tmp = {type: cur.replace(/[^a-zA-z]+/ig, ''), id: cur.replace(/[^0-9]/ig, '')};
        if(tmp.type==='plans') {
          this.$store.state.weaTimer && clearInterval(this.$store.state.weaTimer);
          this.$store.dispatch('getPlanInfo', {_this:this,id:tmp.id});
        }else if(tmp.type==='depot') {
          this.$store.dispatch('getWeather', {_this:this,url:'https://weather.sb.im/get'});
        }
        return cur;
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
  .edit-item {
    min-height: 40px;
    line-height: 40px;
    padding: 8px 0;
  }
  .edit-item .label {
    position: relative;
    padding-left: 40px;
    width: 32%;
    white-space: nowrap;
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
  }
  .edit-item .label img {
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
  .edit-item.des .text{min-height: 60px;}
  .edit-item.file {
    height: 40px;
    line-height: 40px;
  }
  .edit-item.file a {overflow: hidden;}
  .edit-item.file input[type='file'] {
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    opacity: 0;
  }
  .edit-item .text {width: 68%;}
  .edit .maps {
    padding: 20px 0;
  }
  .edit .maps .way-box {
    width: 450px;
    height: 320px;
    background-color: #eee;
    border: 1px solid #e4eaef;
    border-radius: 10px;
    overflow: hidden;
  }
</style>
