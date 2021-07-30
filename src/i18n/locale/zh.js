import elMsg from 'element-ui/lib/locale/lang/zh-CN';

export const name = '简体中文';

export default {
  ...elMsg,
  common: {
    air: '无人机',
    depot: '机场',
    plan: '任务',
    overview: '概况',
    confirm: '确定',
    cancel: '取消',
    view: '查看',
    edit: '编辑',
    save: '保存',
    delete: '删除',
    file: '文件',
    download: '下载',
    retry: '重试',
    clear: '清空',
    none: '暂无',
    status: {
      '-3': 'precheck 失败',
      '-2': '',
      '-1': '未连接',
      0: '正常',
      1: '已关闭',
      2: '网络错误'
    }
  },
  login: {
    username: '账号',
    error_username: '请输入账号',
    password: '密码',
    error_password: '请输入密码',
    button: '登录',
    error: '登录失败：错误代码 {code}',
    failed: '登录失败：用户名或密码错误',
    expired: '会话已过期，请重新登录'
  },
  header: {
    title: 'Superdock 无人机自动机场',
    action: {
      title: '操作中心',
      popup: '自动弹出'
    },
    notify: {
      title: '通知记录'
    },
    status: {
      title: '通讯状态'
    },
    network: {
      loss: '丢包率 {loss}%',
      delay: '延迟 {delay}ms'
    },
    logout: '退出'
  },
  aside: {
    fold: '收起菜单',
    unfold: '展开菜单'
  },
  plan: {
    view: {
      title: '查看任务',
      run: '执行任务',
      stop: '终止任务',
      history: '任务执行历史',
      run_time: '执行时间',
      raw_data: '原始数据',
      auto_run: '自动处理结果',
      logs: '飞行日志',
      sever_logs: '服务器日志',
      pending: '任务正在终止 ...',
      stop_run: '任务已经终止',
      stop_fail: '任务终止失败：{code}'
    },
    job: {
      file: '查看文件'
    },
    edit: {
      add: '新建任务',
      edit: '编辑任务',
      create_failed: '创建任务失败：错误代码 {code}',
      update_failed: '编辑任务失败：错误代码 {code}',
      name_inp: '请输入任务名称',
      desc_inp: '请输入任务描述',
      air_inp: '请选择执飞无人机',
      delete_title: '删除任务',
      delete_tips: '确定要永久删除此任务吗？'
    },
    file: {
      key: {
        waypoint: '航点',
        speaker: '喊话器音频',
        lua: '自定义流程',
        droneconfig: '自定义无人机配置'
      },
      new: '新增',
      select: '选择文件',
      pending: '\u3000上传中',
      re: '重新上传',
      error: '上传文件失败：错误代码 {code}'
    },
    name: '任务名称',
    desc: '任务描述',
    desc_no: '暂无任务描述',
    files: '文件列表',
    air: '执飞无人机',
    ctime: '创建时间'
  },
  air: {
    signal: '信号强度',
    status: {
      standby: '待机',
      flying: '飞行中',
      error: '错误',
      '': '--'
    },
    mode: {
      auto: '自动模式',
      guide: '引导模式',
      fixed: '定点模式',
      loiter: '悬停模式',
      rtl: '返航模式',
      land: '降落模式',
      unknown: '未知模式'
    },
    flight: {
      time: '时长',
      speed: '速度',
      height: '高度'
    },
    battery: {
      remain: '电量',
      voltage: '电压'
    },
    gps: {
      satellites: '{satcount} 星 {type}'
    },
    ctl: {
      hover: '悬停',
      return: '返航',
      takeoff: '起飞',
      runplan: '开始任务',
      up: '上升 {num} 米',
      down: '下降 {num} 米',
      land_backup: '降落到备用点',
      plan_ready: '任务准备就绪，是否立即执行？'
    },
    map: {
      setROI: '朝向此处',
      setROInone: '取消朝向',
      setTarget: '飞往此处',
      mode_brake: '停止',
      prompt: '请输入参数',
      invalid_input: '参数值无效',
      lat: '纬度 Latitude',
      lng: '经度 Longitude',
      height: '目标高度',
      speed: '飞行速度'
    }
  },
  status: {
    disconnected: '当前节点未连接',
    parameters: '节点设置',
    set_param_failed: '参数设置失败：{message} 错误代码 {code}',
    log: '日志',
    no_log: '暂无日志',
    popup: '弹出',
    history: '历史'
  },
  control: {
    title: '高级控制',
    abnormal: '通讯状态异常，无法发送控制指令。',
    pending: '操作执行中 ...',
    error: '操作失败！'
  },
  monitor: {
    title: '实时监控',
    connecting: '连接中 ...',
    disconnected: '连接已断开',
    no_video: '未找到视频源',
    fullscreen: '全屏',
    exit_fullscreen: '退出全屏',
    source: {
      title: '视频源',
      empty: '暂无可用视频源',
      visual: '可见光',
      thermal: '红外',
      msx: '融合',
      reload: '重载视频',
      reconnect: '重新连接'
    },
    control: {
      title: '控制',
      empty: '暂无可用控制',
      click: '信息探针',
      target: '指点朝向',
      gimbal: '云台角度',
      zoom: '变焦倍率',
      stick: '虚拟摇杆'
    },
    action: {
      title: '动作',
      empty: '暂无可用动作',
      take_photo: '拍照',
      start_record: '开始录像',
      stop_record: '停止录像',
      refocus: '重新对焦',
      ffc_calibrate: '进行 FCC 校准',
      enable_show_temp: '开始测温',
      disable_show_temp: '停止测温'
    },
    gimbal: {
      reset: '回中'
    },
    zoom: {
      reset: '复位'
    }
  },
  depot: {
    status: {
      ready: '就绪',
      charging: '充电中',
      running: '运行中',
      protect: '异常保护',
      error: '错误'
    },
    power: {
      status: '供电',
      cable: '市电',
      solar: '光伏',
      ups: 'UPS'
    },
    door: {
      status: '舱门',
      opened: '开启',
      moving: '运动中',
      closed: '关闭'
    },
    fix: {
      status: '固定器',
      opened: '开启',
      moving: '运动中',
      closed: '关闭'
    },
    charger: {
      status: '充电器',
      voltage: '电压',
      set_voltage: '设定电压',
      voltage_chart: '电压图表 (V)',
      current: '电流',
      set_current: '设定电流',
      current_chart: '电流图表 (A)',
      power: '功率',
      power_chart: '功率图表 (W)',
      _chart: '暂无图表'
    },
    ctl: {
      charge_on: '开始充电',
      charge_off: '停止充电',
      stop: '急停',
      dooropen: '打开舱门',
      doorclose: '关闭舱门',
      fixdrone: '固定无人机',
      freedrone: '松开无人机',
      pickbattery: '安装飞机电池',
      mountbattery: '取下飞机电池',
      reset: '复位'
    }
  },
  battery: {
    title: '智能电池',
    id: '序列号',
    temp: '温度',
    cap: '容量',
    cur: '电流',
    remain: '剩余',
    cycle: '循环次数',
    vol_cell: '电压',
    vol: '总电压',
    status: '状态',
    bal: '均衡状态',
    st: {
      'DISCHARGING': '放电中',
      'CHARGING': '充电中',
      'Charging Fully': '已充满',
      'Switch ON Discharging': '放电开',
      'Switch OFF Discharging': '放电关闭',
      'Switch ON Charging': '充电开',
      'Switch OFF Charging': '充电关闭',
      'PROTECTION(Short-circuited)': '短路保护',
      'PROTECTION(Low Temperature)': '放电低温保护',
      'PROTECTION(High Temperature)': '放电高温保护',
      'PROTECTION(Low Temperature Charging)': '充电低温保护',
      'PROTECTION(High Temperature Charging)': '充电高温保护',
      'PROTECTION(Overcharging)': '过充保护',
      'PROTECTION(Over Discharging)': '过放保护',
      'PROTECTION(Overcurrent Charging)': '充电过流保护',
      'PROTECTION(Overcurrent Discharging)': '放电过流保护',
    }
  },
  weather: {
    title: '室外天气',
    wind: {
      caption: '实时风速',
      speed: '风速',
      direction: '风向',
    },
    rain: {
      caption: '预计降水量',
    },
    now: '现在',
    min_before: '一分钟前',
    feel: '天气',
    hum: '湿度',
    temp: '气温'
  },
  map: {
    waypoint: '路径点',
    satellite: '卫星地图',
    clear: '清除轨迹',
    follow: '跟踪',
    fit: '适应',
    manual: '手动'
  },
  debug: {
    title: '调试',
    send: '发送',
    no_recent: '暂无最近使用项。'
  },
  custom: {
    title: '自定义数据'
  },
  settings: {
    title: '节点设置'
  }
};
