import Vue from 'vue'
import Vuex from 'vuex'
import PaPaParse from 'papaparse'
import Config from './config.json'
import API from './API.js'

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    api: API,
    config: Config,
    token: '',
    nodes: [],
    plans: [],
    links: [],
    active: '',
    initPage: 'depot',// 初始页面'plans'/'depot'/'air'
    planMap: [],
    planInfo: {},
    planLogs: [],
    planPage:'view',
    weaInfo: {},
    cyForecast: false,
    cyRealtime: false,
    cyTimer: null,
    weaTimer: null,
    statusLive: false
  },
  mutations: {
    config(state, arg) {
      let keys = Object.keys(state.api);
      state.config = arg.config;
      keys.forEach(function (key,index) {
        let server = (state.api[key].indexOf(arg.config.server)===-1?arg.config.server:''),
          suffix = (state.api[key].indexOf(arg.config.suffix)===-1?arg.config.suffix:'');
        state.api[key] = server + state.api[key] + suffix;
        index === keys.length-1 && arg.callback && typeof arg.callback === 'function' && arg.callback();
      });
    },
    token(state, config) {
      state.token = config.token
      if (config.url_token != undefined) {
        state.config.suffix = state.config.suffix + config.token
      }
    },
    itemAdd(state, arg) {
      switch (arg.type) {
        case 'nodes':state.nodes = arg.data;break;
        case 'plans':state.plans = arg.data;break;
      }
      arg.callback && arg.callback();
    },
    linkAdd(state, arg) {
      if (state.links.length === 0) {
        state.links.push(arg);
      } else {
        // 先判断类型，若不存在对应类型则直接添加，若存在则继续判断是否有相同id存在，不存在则添加
        state.links.findIndex(val => val.type === arg.type) === -1 ?
          state.links.push(arg) :
            (state.links.findIndex(val => {
                return val.type === arg.type && (+val.item.id) === (+arg.item.id);
              }) === -1 && state.links.push(arg));
      }
      // 激活对应Tab
      state.active = arg.type + arg.item.id;
    },
    tabChange(state, item) {
      state.active = item;
    },
    linkDel(state, arg) {
      state.links.splice(state.links.findIndex(val => {
        return val.type === arg.type && val.item.id === (+arg.id)
      }),1);
    },
    planLink(state, name){
      state.planPage = name;
    },
    planAdd(state, data) {
      state.plans.push(data);
      state.planPage = 'view';
    },
    planSave(state, arg) {
      arg._this.$set(state.plans,state.plans.findIndex(val => val.id === (+arg.data.id)),arg.data);
      arg._this.$set(state.links,state.links.findIndex(val => {
        return val.type === 'plans' && val.item.id === (+arg.data.id);
      }),{type:'plans',item:arg.data});
    },
    planDel(state, id) {
      state.plans.splice(state.plans.findIndex(val => val.id===(+id)),1);
    },
    planInfo(state, info) {
      state.planInfo = info;
    },
    planLogs(state, logs) {
      state.planLogs = logs;
    },
    planMap(state, maps) {
      state.planMap = maps;
    },
    weatherInfo(state, info) {
      state.weaInfo = info;
    },
    cyForecast(state, data) {
      state.cyForecast = data;
    },
    cyRealtime(state, data) {
      state.cyRealtime = data;
    },
    cyTimer(state, timer) {
      state.cyTimer = timer;
    },
    weatherTimer(state, timer) {
      state.weaTimer = timer;
    },
    statusLive(state, status) {
      state.statusLive = status;
    }
  },
  actions: {
    // 项目全局初始化
    appInit(context,_this) {
      _this.$http.get(`${location.protocol}//${location.host}/config.json`)
        .then(res => {
          _this.$i18n.locale = res.data.lang ? res.data.lang : context.state.config.lang;
          context.commit('config',{
            config: res.data,
            callback: () => {
              context.dispatch('getSideMenu',{_this,type:'plans'});
              context.dispatch('getSideMenu',{_this,type:'nodes'});
            }
          });
        })
        .catch(() => {
          context.commit('config',{
            config: context.state.config,
            callback: () => {
              context.dispatch('getSideMenu',{_this,type:'plans'});
              context.dispatch('getSideMenu',{_this,type:'nodes'});
            }
          });
        });
    },
    // 获取
    getSideMenu(context,arg) {
      let _this = arg._this;
      // 获取plans/nodes
      _this.$http.get(context.state.api[arg.type])
        .then(res => {
          if (res.status === 200) {
            context.commit('itemAdd', {
              type: arg.type,
              data: res.data,
              callback: () => {
                context.dispatch('initShow',_this);
              }
            });
          }
        })
        .catch(err => {
          console.log(err);
        });
    },
    // 刷新之后默认显示页面处理
    initShow(context, _this) {
      let init = context.state.initPage,
        nodeList = context.state.nodes,
        planList = context.state.plans;
      for (let item of (init!=='plans'?nodeList:planList)) {
        if (init === item.type_name) {
          context.dispatch('tabsAdd',{key:init,item});
          context.dispatch('getStatusLive', {_this,id:item.id,type:init});
          if (init === 'air') {
            context.state.weaTimer && clearInterval(context.state.weaTimer);
          } else if (init === 'depot') {
            context.dispatch('getWeather', {_this,url:'https://weather.sb.im/get'});
          }
          return true;
        } else if (!item.type_name) {
          context.dispatch('tabsAdd',{key:init,item});
          return true;
        }
      }
    },
    // 添加并激活对应Tabs
    tabsAdd(context, arg) {
      // 先判断类型，若不存在对应类型则直接添加，若存在则继续判断是否有相同id存在，不存在则添加
      context.state.links.findIndex(val => val.type === arg.key) === -1 ?
        context.commit('linkAdd', {item:arg.item, type: arg.key}) :
        (context.state.links.findIndex(val => {
          return val.type === arg.key && (+val.item.id) === (+arg.item.id);
        }) === -1 && context.commit('linkAdd', {item:arg.item, type: arg.key}));
    },
    // 获取任务信息
    getPlanInfo(context,arg) {
      context.commit('planLink','view');// 先将任务界面切回'查看任务'
      arg._this.$http.get(`${context.state.api.plans}/${arg.id}`)
        .then(res => {
          if (res.status === 200) {
            context.commit('planInfo',res.data);
            context.dispatch('getPlanLogs',{_this: arg._this, id: res.data.id});
            context.dispatch('getWayPoints',{_this: arg._this, path: res.data['map_path']});
          }
        })
        .catch(err => {
          console.log(err);
        });
    },
    // 获取任务历史日志
    getPlanLogs(context,arg) {
      arg._this.$http.get(`${context.state.api.plans}/${arg.id}/plan_logs`)
        .then(res => {
          if (res.status === 200) {
            for (let val of res.data) {
              val.created_at = val.created_at?arg._this.$utils.timeFomart('YYYY/MM/DD hh:mm:ss',Date.parse(val.created_at)):'';
              val.updated_at = val.updated_at?arg._this.$utils.timeFomart('YYYY/MM/DD hh:mm:ss',Date.parse(val.updated_at)):'';
            }
            context.commit('planLogs',res.data);
          }
        })
        .catch(err => {
          console.log(err);
        });
    },
    // 解析(任务)地图位点
    getWayPoints(context,arg) {
      arg._this.$http.get(context.state.config.server+arg.path)
        .then(res => {
          if (res.status===200) {
            let result = [],
              parseData = PaPaParse.parse(res.data)['data'];
            parseData.forEach((val,index) => {
              val[3]==='16' && result.push({lat:(+val[8]),lng:(+val[9])});
              parseData.length-1 === index && context.commit('planMap',result);
            });
          }
        })
        .catch(err => {
          console.log(err);
          context.commit('planMap',[]);
        });
    },
    // 获取status_live
    getStatusLive(context,arg) {
      arg._this.$http.get(`${context.state.api.nodes}/${arg.id}/status_lives`)
        .then(res => {
          if (!res.data.payload.code || res.data.payload.code !== -1) {
            context.commit('statusLive',res.data);
            if (arg.type === 'depot') {
              let temp = {_this:arg._this, lng:(+res.data.payload.gps.lon)*Math.pow(10,-7), lat:(+res.data.payload.gps.lat)*Math.pow(10,-7)};
              context.dispatch('getCyWeather',temp);
              context.commit('weatherTimer',
                setInterval(() => {
                  context.dispatch('getCyWeather',temp)
                },1000*60)
              );
            }
          } else {
            context.state.cyTimer && clearInterval(context.state.cyTimer);
            context.commit('statusLive',false);
            context.commit('cyForecast',false);
            context.commit('cyRealtime',false);
          }
        })
        .catch(err => {
          console.log(err);
        });
    },
    // 获取彩云APP天气信息
    getCyWeather(context, arg) {
      arg._this.$jsonp(`https://api.caiyunapp.com/v2/Lczn9EiN0OBoG4dw/${arg.lng},${arg.lat}/forecast`)
        .then(res => {
          res.status === 'ok' && context.commit('cyForecast',res.result);
        })
        .catch(err => {console.log(err);});
      arg._this.$jsonp(`https://api.caiyunapp.com/v2/Lczn9EiN0OBoG4dw/${arg.lng},${arg.lat}/realtime`)
        .then(res => {
          res.status === 'ok' && context.commit('cyRealtime',res.result);
        })
        .catch(err => {console.log(err);});
    },
    // 获取天气信息
    getWeather(context, arg) {
      context.state.weaTimer && clearInterval(context.state.weaTimer);
      context.dispatch('getWeaInfo',{_this:arg._this, url:arg.url});
      context.commit('weatherTimer',
        setInterval(() => {
          context.dispatch('getWeaInfo',{_this:arg._this, url:arg.url});
        }, 1000*60));
    },
    getWeaInfo(context, arg) {
      arg._this.$http.get(arg.url)
        .then(res => {
          res.status === 200 && context.commit('weatherInfo', res.data[0]);
        })
        .catch(err => {
          console.log(err);
        });
    }
  }
});
