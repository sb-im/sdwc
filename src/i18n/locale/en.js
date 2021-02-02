import elMsg from 'element-ui/lib/locale/lang/en';

export const name = 'English';

export default {
  ...elMsg,
  common: {
    air: 'Drone',
    depot: 'Depot',
    plan: 'Plan',
    overview: 'Overview',
    confirm: 'Confirm',
    cancel: 'Cancel',
    view: 'View',
    edit: 'Edit',
    save: 'Save',
    delete: 'Delete',
    file: 'File',
    download: 'Download',
    retry: 'Retry',
    clear: 'Clear',
    none: 'None',
    status: {
      '-3': 'precheck Failed',
      '-2': '',
      '-1': 'Not Connected',
      0: 'Normal',
      1: 'Powered Off',
      2: 'Network Error'
    }
  },
  login: {
    username: 'Username',
    error_username: 'Username is required',
    password: 'Password',
    error_password: 'Password is required',
    button: 'Login',
    error: 'Login failed: error code {code}',
    failed: 'Login failed: Invalid Username or Password',
    expired: 'Session expired, please login again'
  },
  header: {
    title: 'Superdock Drone Automatic Airport',
    action: {
      title: 'Action',
      popup: 'Auto popup'
    },
    notify: {
      title: 'Notification'
    },
    status: {
      title: 'Communication'
    },
    network: {
      loss: '{loss}% Packet Loss',
      delay: 'Delay {delay}ms'
    },
    logout: 'Logout'
  },
  aside: {
    fold: 'Fold Menu',
    unfold: 'Unfold Menu'
  },
  plan: {
    view: {
      title: 'View Plan',
      run: 'Run Plan',
      stop: 'Terminate Plan',
      history: 'Plan axecution history',
      run_time: 'Execution time',
      raw_data: 'Raw data',
      auto_run: 'Automatic processing',
      logs: 'Fly logs',
      sever_logs: 'Sever logs',
      pending: 'Terminating plan ...',
      stop_run: 'Plan terminated',
      stop_fail: 'Failed to terminate plan: {code}'
    },
    job: {
      file: 'View File'
    },
    edit: {
      add: 'New Plan',
      edit: 'Edit Plan',
      create_failed: 'Failed to create Plan: Error code {code}',
      update_failed: 'Failed to edit Plan: Error code {code}',
      name_inp: 'Enter the name of plan',
      desc_inp: 'Enter the description of plan',
      air_inp: 'Select the drone',
      delete_title: 'Delete Plan',
      delete_tips: 'Do you really want to permanently delete this plan?'
    },
    file: {
      key: {
        waypoint: 'Waypoint',
        speaker: 'Speaker audio',
        lua: 'Custom plan process',
        droneconfig: 'Custom drone configuration'
      },
      new: 'New',
      select: 'Select file',
      pending: 'Uploading..',
      re: 'Re-Select..',
      error: 'Failed to upload file: Error code {code}'
    },
    name: 'Name',
    desc: 'Description',
    desc_no: 'No description',
    files: 'Files',
    air: 'Flying drone',
    ctime: 'Creation time'
  },
  air: {
    signal: 'Signal Strength',
    status: {
      standby: 'Standby',
      flying: 'Flying',
      error: 'Error',
      '': '--'
    },
    mode: {
      auto: 'Automatic',
      guide: 'Boot',
      fixed: 'Fixed Point',
      loiter: 'Loiter',
      rtl: 'Return',
      land: 'Landing',
      unknown: 'Unknown'
    },
    flight: {
      time: 'Flying for',
      speed: 'Speed',
      height: 'Height'
    },
    battery: {
      remain: 'Battery',
      voltage: 'Voltage'
    },
    gps: {
      satellites: '{satcount} Satellite(s) {type}'
    },
    ctl: {
      hover: 'Hover',
      return: 'Return',
      takeoff: 'Take off',
      runplan: 'Start task',
      up: 'Rise {num} m',
      down: 'Descend {num} m',
      land_backup: 'Land backup',
      plan_ready: 'Plan is ready, start right now?'
    },
    map: {
      setROI: 'Turn Towards Here',
      setROInone: 'Cancel Turn',
      setTarget: 'Fly Here',
      mode_brake: 'Stop',
      prompt: 'Please enter parameters',
      invalid_input: 'Parameter value invalid',
      lat: 'Latitude',
      lng: 'Longitude',
      height: 'Target height',
      speed: 'Flight speed'
    }
  },
  status: {
    disconnected: 'Node Disconnected',
    log: 'Log',
    no_log: 'No log',
    popup: 'Popup',
    history: 'History'
  },
  control: {
    title: 'Advance Control',
    abnormal: 'Communication status abnormal, unable to control.',
    pending: 'Pending ...',
    error: 'Error!'
  },
  monitor: {
    title: 'Realtime Monitor',
    connecting: 'Connecting...',
    disconnected: 'Disconnected',
    no_video: 'Video source not found',
    fullscreen: 'Enter fullscreen',
    exit_fullscreen: 'Exit fullscreen',
    source: {
      title: 'Video Source',
      empty: 'No video sources available',
      visual: 'Visible Light',
      thermal: 'Infrared ray',
      msx: 'Fusion',
      reload: 'Reload Video',
      reconnect: 'Reconnect'
    },
    control: {
      title: 'Control',
      empty: 'No controls available',
      gimbal: 'Gimbal',
      zoom: 'Zoom',
      stick: 'Virtual Joystick'
    },
    action: {
      title: 'Action',
      empty: 'No actions available',
      take_photo: 'Take photo',
      start_record: 'Start record',
      stop_record: 'Stop record',
      refocus: 'Refocus',
      ffc_calibrate: 'Perform FCC calibrate',
      enable_show_temp: 'Start temp measurement',
      disable_show_temp: 'Stop temp measurement'
    },
    gimbal: {
      reset: 'Back center'
    },
    zoom: {
      reset: 'Reset'
    }
  },
  depot: {
    status: {
      ready: 'Ready',
      charging: 'Charging',
      running: 'Running',
      protect: 'Protect',
      error: 'Error'
    },
    power: {
      status: 'Power',
      cable: 'Cable',
      solar: 'Solar',
      ups: 'UPS'
    },
    door: {
      status: 'Hatch',
      opened: 'Opened',
      moving: 'Moving',
      closed: 'Closed'
    },
    fix: {
      status: 'Fixator',
      opened: 'Opened',
      moving: 'Moving',
      closed: 'Closed'
    },
    charger: {
      status: 'Charger',
      voltage: 'Voltage',
      set_voltage: 'Voltage Set',
      voltage_chart: 'Voltage Chart (V)',
      current: 'Current',
      set_current: 'Current Set',
      current_chart: 'Current Chart (A)',
      power: 'Power',
      power_chart: 'Power Chart (W)',
      _chart: 'Chart Unavailable'
    },
    ctl: {
      charge_on: 'S-charge',
      charge_off: 'E-charge',
      stop: 'Stop',
      dooropen: 'Open door',
      doorclose: 'Close door',
      fixdrone: 'Fixed Drone',
      freedrone: 'Release Drone',
      pickbattery: 'Install-Bat',
      mountbattery: 'Remove-Bat',
      reset: 'Reset',
    }
  },
  battery: {
    title: 'Smart Battery',
    id: 'Serial',
    temp: 'Temperature',
    cap: 'Capacity',
    cur: 'Current',
    remain: 'Remaining',
    cycle: 'Cycle Count',
    vol_cell: 'Voltage',
    vol: 'Total Voltage',
    status: 'Status',
    bal: 'Balance',
    st: {
      'DISCHARGING': 'Discharging',
      'CHARGING': 'Charging',
      'Charging Fully': 'Fully Charged',
      'Switch ON Discharging': 'Switch ON Discharging',
      'Switch OFF Discharging': 'Switch OFF Discharging',
      'Switch ON Charging': 'Switch ON Charging',
      'Switch OFF Charging': 'Switch OFF Charging',
      'PROTECTION(Short-circuited)': 'PROTECTION(Short-circuited)',
      'PROTECTION(Low Temperature)': 'PROTECTION(Low Temperature)',
      'PROTECTION(High Temperature)': 'PROTECTION(High Temperature)',
      'PROTECTION(Low Temperature Charging)': 'PROTECTION(Low Temperature Charging)',
      'PROTECTION(High Temperature Charging)': 'PROTECTION(High Temperature Charging)',
      'PROTECTION(Overcharging)': 'PROTECTION(Overcharging)',
      'PROTECTION(Over Discharging)': 'PROTECTION(Over Discharging)',
      'PROTECTION(Overcurrent Charging)': 'PROTECTION(Overcurrent Charging)',
      'PROTECTION(Overcurrent Discharging)': 'PROTECTION(Overcurrent Discharging)',
    }
  },
  weather: {
    title: 'Outdoor weather',
    wind: {
      caption: 'Realtime windspeed',
      speed: 'Speed',
      direction: 'Direction',
    },
    rain: {
      caption: 'Estimated precipitation',
    },
    now: 'Now',
    min_before: '1 min. before',
    feel: 'Weather',
    hum: 'Hum',
    temp: 'Tem'
  },
  map: {
    waypoint: 'Waypoint',
    satellite: 'Satellite Map',
    clear: 'Clear Track',
    follow: 'Follow',
    fit: 'Fit',
    manual: 'Manual'
  },
  debug: {
    title: 'Debug',
    send: 'Send',
    no_recent: 'No recently used items.'
  },
  custom: {
    title: 'Custom Data'
  },
  settings: {
    title: 'Settings'
  }
};
