/**
 * `element-ui` load on demand
 * @see http://element-cn.eleme.io/#/zh-CN/component/quickstart#an-xu-yin-ru
 */

import Vue from 'vue';
import {
  Menu,
  Submenu,
  MenuItem,
  Input,
  InputNumber,
  Button,
  ButtonGroup,
  Form,
  FormItem,
  Icon,
  Row,
  Col,
  Container,
  Header,
  Aside,
  Main,
  Footer,
  Loading,
  MessageBox,
  Message,
  Notification
} from 'element-ui';
import ElementLocale from 'element-ui/lib/locale';
import i18n from './i18n';

/**
 * `element-ui` and `vue-i18n` integration with load on demand
 * @see http://element-cn.eleme.io/#/zh-CN/component/i18n#an-xu-jia-zai-li-ding-zhi-i18n
 */
ElementLocale.i18n((key, value) => i18n.t(key, value));

Vue.use(Menu);
Vue.use(Submenu);
Vue.use(MenuItem);
Vue.use(Input);
Vue.use(InputNumber);
Vue.use(Button);
Vue.use(ButtonGroup);
Vue.use(Form);
Vue.use(FormItem);
Vue.use(Icon);
Vue.use(Row);
Vue.use(Col);
Vue.use(Container);
Vue.use(Header);
Vue.use(Aside);
Vue.use(Main);
Vue.use(Footer);

Vue.use(Loading.directive);

Vue.prototype.$loading = Loading.service;
Vue.prototype.$msgbox = MessageBox;
Vue.prototype.$alert = MessageBox.alert;
Vue.prototype.$confirm = MessageBox.confirm;
Vue.prototype.$prompt = MessageBox.prompt;
Vue.prototype.$notify = Notification;
Vue.prototype.$message = Message;
