import Vue from 'vue'
import VueI18n from 'vue-i18n'
Vue.use(VueI18n)
export default new VueI18n({
  locale: 'zh-cn',
  messages: {
    'en': require('./locale/en'),
    'zh-cn': require('./locale/zh-cn'),
    'zh-tw': require('./locale/zh-tw')
  }
})
