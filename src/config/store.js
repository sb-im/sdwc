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
    items: [],
    links: [],
    active:'task',
    taskPage:'view'
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
    items(state, items) {
      state.items = items
    },
    linkAdd(state, item) {
      if (state.links.length === 0) {
        state.links.push(item);
      } else {
        // 先判断是否存在然后再添加
        state.links.findIndex(val => {
          return (+val.id) === (+item.id);
        }) === -1 && state.links.push(item);
      }
      // 激活对应tabs
      state.active = item.id+'';
    },
    tabChange(state, item){
      state.active = (item.id?item.id:item)+'';
    },
    linkDel(state, id) {
      // state.links = state.links.filter(tab => tab.id !== item_id)
      state.links = state.links.filter(tab => tab.id !== id);
    },
    taskLink(state, name){
      state.taskPage = name;
    }
  }
})
