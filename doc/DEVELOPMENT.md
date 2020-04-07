# SDWC - Development

## 翻译约定

|English|  中文  |
|:-----:|:-----:|
|node   |节点|
|plan   |任务|
|drone  |无人机|
|depot  |机场|
|point  |`// TODO`|

## 构建依赖

- Node.js >= 10.15
- yarn >= 1.15

## 使用的框架或类库

- 前端框架： [vue][vue], [vuex][vuex], [vue-router][vue-router]
- 多语言： [vue-i18n][vue-i18n]
- UI 组件： [element-ui][element-ui]
- 网络请求： [wretch][wretch], [fetch-jsonp][fetch-jsonp]
- 图表： [chartist][chartist]
- 地图： [Google Map JavaScript API][googlemap]， [高德地图 API][amap]
- MQTT 通信： [mqtt][mqtt]
- 视频串流： [flv.js][flv.js], [hls.js][hls.js], [WebRTC][webrtc]
- 其他
  - [papaparse][papaparse]: CSV 文件解析
  - [jsonrpc-lite][jsonrpc-lite]: JSON-RPC 生成与解析

## 目录结构

```sh
.
├── assets/             # 静态资源，图标、视频等
├── dist/               # 构建产物
├── doc/                # 文档
├── scripts/            # CI 构建脚本，webpack 配置文件
└── src/
    ├── api/            # 所用到的 HTTP 与 MQTT 接口的封装
    ├── components/     # 可复用组件
    ├── constants/      # 应用运行中不会更改的常量或配置项
    ├── i18n/           # 国际化翻译
    │   ├── locale/     # 语言文件
    │   ├── common.js   # 各语言间通用的常规格式
    │   └── index.js
    ├── pages/
    │   ├── node/       # 节点页面，根据传入的对象决定加载无人机组件或机场组件
    │   ├── overview/   # 概况页面，显示各种实体的数量及地图概览
    │   ├── panel/      # 登录后页面的框架，包括顶部操作栏、侧边导航以及底部版本信息
    │   ├── plan/       # 任务页面，根据路由决定加载 新建/查看/编辑 任务组件
    │   └── login.vue   # 登录页面，未登录时所有访问都将重定向到此页面
    ├── store/          # vuex 状态管理实例
    │   ├── modules     # 分离的 store 模块
    │   ├── actions.js
    │   ├── getters.js
    │   └── index.js
    ├── styles/         # 公共样式
    ├── util/
    │   ├── browser-hacks.js  # 判断操作系统及浏览器，并在 document.body 上添加类名
    │   ├── element.js        # element-ui 按需引入
    │   └── plugin-mqtt.js    # 封装 mqtt 请求方法为 vue 插件
    ├── App.vue         # vue 应用的根组件
    ├── config.json     # 示例配置文件
    ├── index.d.ts      # 全局类型定义
    ├── main.js         # 单页应用的入口点
    ├── router.js       # 路由配置
    └── sdwc.d.ts       # SDWC 内部数据类型定义
```

## 项目构建

```sh
# 建立或复制 config.json 到项目根目录
cp src/config.json .

# 安装依赖
yarn install

# 运行 webpack-dev-server ，监听 http://localhost:8080
yarn dev

# development build （构建后的页面包含 DEVELOPMENT 字样）
yarn build --env.dev

# production build
yarn build
```

构建产物位于项目根目录中的 `dist` 目录。将 `assets` 目录复制到 `dist` 目录中，即可作为 wwwroot 部署。

更详细的步骤可以参考 [CI 构建脚本](/scripts/gitlab-ci.sh)。

## 路由结构

- /login
- /panel
  - overview
  - node/:id
  - plan
    - new
    - :id/view
    - :id/edit

## 初始化流程

应用的入口点为 [`src/main.js`](/src/main.js)，其初始化步骤为：

1. 创建 `store` 实例
2. 请求 `/config.json` 以获取应用配置
3. 尝试恢复存储在 `sessionStorage` 中的 token 以及存储在 `localStorage` 中的用户设置
4. 使用初始化后的 `store` 创建并挂载 vue 根组件

若用户 token 不存在或已过期，router 会将所有访问重定向至[登录页面](/src/pages/login.vue)；若 token 有效，则根据当前 URL 加载不同的页面。

登录后的所有页面都包含在 [panel](/src/pages/panel/panel.vue) 中，其初始化步骤为：

1. 等待应用配置（上一部分第 2 步）加载完毕
2. 加载用户信息，设置 MQTT Client 的 Client ID，并建立 MQTT 连接
3. 加载节点信息（包括机场及无人机）并订阅节点的 MQTT topic；加载任务信息

## 登出流程

当用户点击顶部操作栏中的登出，或者 token 过期后，登出的步骤为：

1. 请求登出 API
2. 清除 `localStorage` 中存储的用户信息
3. 断开 MQTT 连接
4. 清除 vuex store 中存储的用户、节点及任务信息
5. 重定向至登录页面

## Vuex Store 结构

```sh
store/
├── modules               # State 模块
│   ├── config.js         # 应用配置
│   ├── index.js
│   ├── node.js           # 节点，包括无人机与机场
│   ├── notification.js   # MQTT 调用通知
│   ├── plan.js           # 任务及执行记录
│   ├── preference.js     # 自定义设置
│   └── user.js           # 用户信息及 token
├── actions.js
├── getters.js
└── index.js
```

## MQTT 连接

### 订阅 topic

SDWC 使用 MQTT over Websocket 与节点后端进行数据交换。SDWC 建立 MQTT 连接的 Clinet ID 格式为 `sdwc.${uid}-${timestamp}`。

在 [panel](/src/pages/panel/panel.vue) 的初始化过程中，节点信息加载完成后，`dispatch` vuex action `subscirbeNodes`，其调用 [mqtt API](/src/api/mqtt.js) 的 `subscribeNode` 方法，订阅每个节点的以下 topic：

- `nodes/${id}/rpc/send`
- `nodes/${id}/rpc/recv`
- `nodes/${id}/message`
- `nodes/${id}/status`

若节点包含指定的 Point 类型，则额外订阅对应的 topic （前缀均为 `nodes/${id}/msg/` ）：

|point_type_name|topic            |
|:-----:|:-----------------------:|
|drone_status|`depot_status`, `notification`, `charger`|
|depot_status|`drone_status`, `notification`|
|weather|`weather` |
|battery|`battery` |
|gimbal |`gimbal`  |
|map    |`position`|

### JSON-RPC 调用

[mqtt-plugin](/src/util/mqtt-plugin.js) 定义了一个 vue 插件，提供通过 MQTT 发起 JSON-RPC 调用的功能，并将调用记录保存至 vuex store 中以供显示。

在组件中使用 vue 实例的 `$mqtt` 方法来发起 JSON-RPC 调用。其使用了 [mqtt API](/src/api/mqtt.js) 中的 `invoke` 方法。若此时 MQTT 连接尚未建立，调用数据将被缓存在列表中，待连接建立后按顺序发出。

[vue]: https://github.com/vuejs/vue
[vuex]: https://github.com/vuejs/vuex
[vue-router]: https://github.com/vuejs/vue-router
[vue-i18n]: https://github.com/kazupon/vue-i18n
[element-ui]: https://github.com/ElemeFE/element
[wretch]: https://github.com/elbywan/wretch
[fetch-jsonp]: https://github.com/camsong/fetch-jsonp
[chartist]: https://github.com/gionkunz/chartist-js
[googlemap]: https://developers.google.com/maps/documentation/javascript/tutorial
[amap]: https://lbs.amap.com/api/javascript-api/summary
[mqtt]: https://github.com/mqttjs/MQTT.js
[flv.js]: https://github.com/Bilibili/flv.js/
[hls.js]: https://github.com/video-dev/hls.js/
[webrtc]: https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API
[papaparse]: https://github.com/mholt/PapaParse
[jsonrpc-lite]: https://github.com/teambition/jsonrpc-lite
