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
    aside: '',
    taskAction:'view'
  },
  mutations: {
    config(state, config) {
      state.config = config
      Object.keys(state.api).forEach(function (key) {
        state.api[key] = config.server + state.api[key] + config.suffix
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
    linkadd(state, item) {
      if (state.links.length === 0) {
        state.links.push(item)
      } else {
        // 去重
        state.links.push(item);
        let temp = new Set(state.links);
        state.links = [...temp];
        /*let t = 0
        for (let link of state.links) {
          if (link.id == item.id) {
            t = 1
          }
        }
        if (t == 0) {
          state.links.push(item)
        }*/
      }
    },
    asideLink(state,item){
      state.aside = item;
    },
    taskLink(state,item){
      state.taskAction = item;
    },
    linkdel(state, item) {
      // state.links = state.links.filter(tab => tab.id !== item_id)
      state.links = state.links.filter(tab => tab !== item);
    }
  }
})
