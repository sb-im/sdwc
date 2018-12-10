import Vue from 'vue'
import Vuex from 'vuex'
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
    planInfo: {},
    planLogs: [],
    planPage:'view'
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
    linkDel(state, obj) {
      state.links.forEach((val,index) => {
        if (val.type === obj.type && val.item.id === (+obj.id)) {
          state.links.splice(index,1);
          return true;
        }
      });
    },
    planLink(state, name){
      state.planPage = name;
    },
    planInfo(state, info) {
      state.planInfo = info;
    },
    planLogs(state, logs) {
      state.planLogs = logs;
    }
  },
  actions: {
    // 获取任务信息
    getPlanInfo(context,arg) {
      context.commit('planLink','view');// 先将任务界面切回'查看任务'
      arg._this.$http.get(`${context.state.api.plans}/${arg.id}`)
        .then(res => {
          if (res.status === 200) {
            context.commit('planInfo',res.data);
            context.dispatch('getPlanLogs',{_this: arg._this, id: res.data.id});
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
            res.status===200 && context.commit('planLogs',res.data);
          }
        })
        .catch(err => {
          console.log(err);
        });
    }
  }
});
