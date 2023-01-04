# SDWC - Changelog

## 2023-01-04 v4.0.0

Use api/v3

### Add
- Layout
  - config sidebar
- Task
  - WPML format airline
- Speaker
  - speaker record audio
- Map
  - gimbal direction
- Monitor
  - SRS webrtc
- Status
  - Setting Page

### Change
- Weather
  - caiyun => heweather

### Fix
- Monitor
  - gimbal target and current show
  - click drift
- Status
  - charger_info
- Debug
  - jsonrpc single number

## 2020-07-24 v3.5.0

### Add
- Overview
  - show place markers on map
  - notify popup and history

- Map
  - Add mapbox
  - Heatmap support

- Monitor
  - joystick toggle

- Add custom
- router login api

### Change
- API preflight

### Fix
- node loading spinner not centered on ipad
- Map
  - map follow, dragged
  - google, mapbox

- Preflight
  - background on safari
  - touch screen support
- mqtt keepalive

## 2020-04-07 v3.4.0

### 新增

- 顶部工具栏
  - 记录通知历史
  - 点击通讯状态中的节点名称，快速导航到节点页面

- 侧边栏
  - 可折叠式侧边栏
  - 根据窗口或屏幕大小自动折叠或展开

- 通用组件
  - 视频监控的全屏按钮与其他界面元素风格一致
  - 地图中可展示无人机朝向
  - 高级控制按钮可指示任务执行状态
  - 调试组件可指定命令参数

- Login 登录页面
  - 用户名输入框自动聚焦，按回车可切换焦点到密码输入框，或直接登录
  - 可配置在底部展示备案信息

- Overview 概况页面
  - 展示无人机/机场/任务数量及总览地图
  - 总览地图可自动适应显示范围

- Plan 任务页面
  - 新增起飞前检测机制，包括节点状态及实时天气。检测通过后滑动滑块确认执行任务，并自动跳转到机场页
  - 执行/停止任务后显示通知
  - 页面见切换时，平滑切换路径点地图
  - 任务执行历史可排序及分页展示

- Depot 机场页面
  - 新增机场状态条，包含供电/舱门等状态，及充电数据图表
  - 更精确的历史天气图表

- Drone 无人机页面
  - 视频监控画面中可通过鼠标拖动/触屏滑动来控制俯仰角
  - 卫星地图可切换自由视角或跟踪视角
  - 卫星地图可手动清除轨迹，限制路径点数量为 1024 个
  - 卫星地图可配置展示多个标记点，可选无人机到标记点的预计飞行路线
  - 卫星地图鼠标右键/触屏长按，实时下达控制指令

- 其它
  - 所有界面及操作适配 iPad
  - 统一界面图标风格
  - 登录超时后自动退回到登录页面
  - 优化英文界面翻译

## 2019-08-16 v3.3.0

### 新增

- **完全重构**
- 按需动态加载控制组件
- 刷新页面后保留登录状态
- 执行 MQTT 调用后显示通知
- 可选高德地图作为地图源
- 当屏幕宽度大于 1200px 时使用双栏布局
- 实时天气组件
- 动态调试组件
- 智能电池组件

## 2019-05-21 v3.2.2

### 新增

- WebRTC 显示错误信息及自动重连

### 修复

- 无人机控制模式及调试组件修复

## 2019-04-22 v3.2.1

### 新增

- 自定义 WebRTC ICE Server

### 修复

- GPS 状态名称调整
- 无人机状态文本调整

## 2019-04-20 v3.2.0

### 新增

- 下载任务地图及其他附加文件
- 显示无人机状态及飞行路线
- 控制无人机 gimbal mode and angle
- 添加无人机“自稳模式”
- WebRTC 视频串流

### 修复

- 任务编辑 401 错误
- 天气预报不可用
- JSON-RPC 默认参数应为空数组

## 2019-03-28 v3.1.0

### 新增

- 未登录时重定向所有访问到登录页面
- MQTT 通信模块
- 顶部操作栏中显示用户邮箱
- 顶部操作栏中显示节点通信状态

### 修复

- 任务查看 401 错误
