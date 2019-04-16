<template>
  <el-main class="content">
    <el-header v-if="plan==='add'" class="header font-24">
      <img src="../../../assets/images/task/t_add.svg"/>{{ $t('plan.edit.add') }}
      <div class="f-r font-16">
        <el-button @click.prevent="submitPlan" type="danger" icon="el-icon-plus">{{ $t('plan.edit.create') }}</el-button>
        <el-button @click.prevent="backEvent" icon="el-icon-close">{{ $t('common.back') }}</el-button>
      </div>
    </el-header>
    <el-header v-if="plan==='edit'" class="header font-24">
      <img src="../../../assets/images/task/t_edit.svg"/>{{ $t('plan.edit.alter') }}
      <div class="f-r font-16">
        <el-button @click.prevent="submitPlan" type="warning" icon="el-icon-document">{{ $t('plan.edit.save_plan') }}</el-button>
        <el-button @click.prevent="deletePlan" type="danger" icon="el-icon-delete">{{ $t('plan.edit.delete_plan') }}</el-button>
        <el-button @click.prevent="backEvent" icon="el-icon-close">{{ $t('common.back') }}</el-button>
      </div>
    </el-header>
    <el-row type="flex" class="edit" tag="section">
      <el-col class="edit-box" tag="ul">
        <li class="edit-item d-f">
          <p class="label"><img src="../../../assets/images/task/t_info.svg"/>{{ $t('plan.plan_name') }}：</p>
          <p class="text"><el-input v-model="planName" :placeholder="$t('plan.edit.name_inp')"></el-input></p>
        </li>
        <li class="edit-item d-f des">
          <p class="label">{{ $t('plan.plan_desc') }}：</p>
          <p class="text"><el-input v-model="planDesc" type="textarea" :placeholder="$t('plan.edit.desc_inp')"></el-input></p>
        </li>
        <li class="edit-item d-f">
          <p class="label"><img src="../../../assets/images/task/t_drone.svg"/>{{ $t('plan.plan_air') }}：</p>
          <p class="text">
            <el-select class="d-b" v-model="planNode" :placeholder="$t('plan.edit.air_inp')">
              <el-option v-for="(val,index) in airNodes" :key="index" :label="val.name" :value="val.id"></el-option>
            </el-select>
          </p>
        </li>
        <li class="edit-item d-f">
          <p class="label"><img src="../../../assets/images/task/t_frequency.svg"/>{{ $t('plan.plan_cycle') }}：</p>
          <p class="text">
            <el-select disabled class="d-b" v-model="planCycle" :placeholder="$t('plan.edit.cycle_inp')">
              <el-option v-for="(val,index) in cycleTypes" :key="index" :label="val.name" :value="val.id"></el-option>
            </el-select>
          </p>
        </li>
        <li class="edit-item d-f">
          <p class="label"><img src="../../../assets/images/task/t_first.svg"/>{{ $t('plan.plan_first_time') }}：</p>
          <p class="text">
            <el-date-picker disabled v-model="planStart" style="width: 100%" type="datetime" @change="startTime" :placeholder="$t('plan.edit.first_time_inp')"></el-date-picker>
          </p>
        </li>
        <li class="edit-item d-f file">
          <p class="label"><img src="../../../assets/images/task/t_file.svg"/>{{ $t('plan.plan_mapfile') }}：</p>
          <p class="text">
            <a v-if="plan === 'edit'" :href="$store.state.planInfo.map_path?$store.state.config.server+$store.state.planInfo.map_path:'javascript:;'" download class="el-button el-button--primary" :class="{'is-disabled':!$store.state.planInfo.map_path}">
              <i class="el-icon-download"></i><span>{{ $t('common.download') }}</span>
            </a>
            <a href="javascript:;" class="pos-r el-button el-button--primary">
              <i class="el-icon-upload"></i><span>{{ plan === 'edit'?$t('common.re_upload'):$t('common.upload') }}</span>
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
  import {mapGetters} from 'vuex';
  import PaPaParse from 'papaparse'
  import MapWay from '../../../components/uavtrack'
  export default {
    data() {
      return {
        cycleTypes:[
          {id:0,name:this.$t('plan.edit.cycle_type_1')},
          {id:1,name:this.$t('plan.edit.cycle_type_2')},
          {id:2,name:this.$t('plan.edit.cycle_type_3')},
          {id:3,name:this.$t('plan.edit.cycle_type_4')},
          {id:4,name:this.$t('plan.edit.cycle_type_5')},
          {id:5,name:this.$t('plan.edit.cycle_type_6')}
        ],
        planName: '',
        planDesc: '',
        planFile: '',
        planNode: '',
        planCycle: '',
        planStart: '',
        showMap: false,
        pathResult: []
      }
    },
    props:{
      plan:{
        type:String,
        default:''
      }
    },
    components: {
      'map-way':MapWay
    },
    created() {
      this.planName = this.plan === 'add' ? '' : this.$store.state.planInfo.name;
      this.planDesc = this.plan === 'add' ? '' : this.$store.state.planInfo.description;
      this.planNode = this.plan === 'add' ? '' : this.$store.state.planInfo.node_id;
      this.planCycle = this.plan === 'add' ? '' : this.$store.state.planInfo.cycle_types_id;
      this.planStart = this.plan === 'add' ? '' : this.$store.state.planInfo.start_time;
      this.showMap = !this.plan === 'add';
      this.pathResult = this.plan === 'add' ? [] : this.$store.state.planMap;
    },
    computed: {
      ...mapGetters([
        'airNodes'
      ])
    },
    methods: {
      backEvent(){
        this.$store.commit('planLink','view');
      },
      mapFlie(ev) {
        this.planFile = ev.target.files[0];
        PaPaParse.parse(ev.target.files[0],{
          complete:res => {
            let temp = [];
            res.data.forEach(val => {val[3]==='16' && temp.push({lat:(+val[8]),lng:(+val[9])});});
            this.pathResult = temp;
            this.showMap = temp.length!==0;
          }
        });
      },
      startTime(date) {
        this.planStart = Date.parse(date);
      },
      submitPlan() {
        if (this.planName!=='') {
          if (this.planNode!=='') {
              // if (this.planCycle!=='') {
                if (this.plan === 'add') {
                  if (this.planFile !== '') {
                    this.submitData('post',data=>{
                      this.$store.commit("planAdd", data);
                      this.$store.commit("linkAdd", {item:data,type:'plans'});
                      this.$store.dispatch('getPlanInfo', {_this:this,id:data.id});
                    });
                  } else this.$message.error(this.$t('plan.edit.please_file'));
                } else {
                  this.submitData('patch',data=>{
                    this.$store.commit("planSave", {data, _this:this});
                    this.$store.dispatch('getPlanInfo', {_this:this, id:data.id});
                  });
                }
              // } else this.$message.error(this.$t('plan.edit.please_cycle'));
          } else this.$message.error(this.$t('plan.edit.please_air'));
        } else this.$message.error(this.$t('plan.edit.please_name'));
      },
      submitData(method,callback) {
        let form = new FormData();
        form.append('name',this.planName);
        form.append('description',this.planDesc);
        this.plan === 'add' && form.append('file',this.planFile);
        form.append('node_id',this.planNode);
        form.append('start_time',this.planStart);
        form.append('cycle_types_id',this.planCycle);
        let url = '';
        if (this.plan === 'add') {
          url = this.$store.state.config.suffix!==''?this.$store.state.api.local.plans+this.$store.state.config.suffix:this.$store.state.api.local.plans;
        } else {
          url = this.$store.state.config.suffix!==''?`${this.$store.state.api.local.plans}/${this.$store.state.planInfo.id}`+this.$store.state.config.suffix:`${this.$store.state.api.local.plans}/${this.$store.state.planInfo.id}`;
        }
        this.$http[method](url, form,{
          headers: {
            Authorization: this.$store.state.token,
            'Content-Type': 'multipart/form-data'
          }
        })
          .then(res => {
            res.status===200 && typeof res.data === 'object' && callback && callback(res.data);
          })
          .catch(err => {
            console.log(err);
          });
      },
      deletePlan() {
        this.$confirm(this.$t('plan.edit.delete_tips'), this.$t('common.system_tips'), {
          confirmButtonText: this.$t('common.comfirm'),
          cancelButtonText: this.$t('common.cancel'),
          type: 'warning'
        }).then(() => {
          let url = this.$store.state.config.suffix!==''?`${this.$store.state.api.local.plans}/${this.$store.state.planInfo.id}`+this.$store.state.config.suffix:`${this.$store.state.api.local.plans}/${this.$store.state.planInfo.id}`;
          this.$http.delete(url, { headers: { Authorization: this.$store.state.token } })
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
          this.$store.dispatch('getWeather', this);
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
  .edit .maps {padding: 20px 0;}
  .edit .maps .way-box {
    width: 450px;
    height: 320px;
    background-color: #eee;
    border: 1px solid #e4eaef;
    border-radius: 10px;
    overflow: hidden;
  }
</style>
