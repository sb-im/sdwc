import elMsg from 'element-ui/lib/locale/lang/en';

export const name = 'English';

export const locale = {
  ...elMsg,
  common: {
    air: 'Drone',
    depot: 'Depot',
    plan: 'Plan',
    overview: 'Overview',
    cancel: 'Cancel',
    view: 'View',
    download: 'Download',
    upload: 'Upload',
    re_upload: 'Re-upload',
    retry: 'Retry',
    clear: 'Clear',
    none: 'None',
  },
  login: {
    username: 'Username',
    error_username: 'Username is required',
    password: 'Password',
    error_password: 'Password is required',
    button: 'Login',
    failed: 'Failed: Invalid Username or Password',
    expired: 'Session expired, please login again'
  },
  header: {
    title: 'Superdock Drone Automatic Airport',
    notify: {
      title: 'Notification',
      clear: 'Clear',
      empty: 'No history notification',
    },
    status: {
      title: 'Communication',
      0: 'Normal',
      1: 'Powered Off',
      2: 'Network Error',
      '-1': 'Not Connected'
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
      pending: 'Sending plan ...',
      start_run: 'Plan started',
      start_fail: 'Failed to start plan: {code}',
      stop_run: 'Plan terminated',
      stop_fail: 'Failed to terminate plan: {code}'
    },
    edit: {
      add: 'Create',
      alter: 'Modify',
      save: 'Save',
      back: 'Cancel & back',
      delete: 'Delete',
      name_inp: 'Enter the name of plan',
      desc_inp: 'Enter the description of plan',
      first_time_inp: 'Select the first run time',
      depot_inp: 'Select to take off and land',
      air_inp: 'Select the drone',
      cycle_inp: 'Select the run cycle',
      cycle: {
        1: 'Manual',
        2: 'Once',
        3: 'EveryHour',
        4: 'EveryDay',
        5: 'EveryWeek',
        6: 'EveryMonth',
      },
      select_map: 'Select map',
      please_name: 'Please enter the name of plan!',
      please_desc: 'Please enter the description of plan!',
      please_air: 'Please select the drone!',
      please_depot: 'Please select to take off and land!',
      please_cycle: 'Please select the run cycle!',
      please_file: 'Please upload the waypoint file!',
      delete_tips: 'This action will delete the plan, will it continue?'
    },
    name: 'Name',
    desc: 'Description',
    desc_no: 'No description',
    air: 'Flying drone',
    depot: 'Depot',
    cycle: 'Cycle',
    mapfile: 'Waypoint file',
    first_time: 'First run time',
    ctime: 'Creation time'
  },
  air: {
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
      '': '-- Mode'
    },
    flight: {
      time: 'Flying for {t}',
      speed: 'Speed {s}m/s',
      height: 'Height {h}m'
    },
    battery: {
      remain: 'Battery {num}%',
      voltage: 'Voltage {num}V'
    },
    gps: {
      satellites: '{num} Satellite(s) {type}'
    },
    gimbal: {
      mavlink: 'Manual',
      neutral: 'Auto',
      rc: 'Remote-Control',
      center: 'Center'
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
    gotoGPS: 'Fly here',
    pointtoGPS: 'Turn towards here',
    gotorelaltGPS: 'Fly here (Change altitude)',
    input_alt: 'Please enter altitude:',
    invalid_alt_input: 'Invalid altitude value'
  },
  control: {
    title: 'Advance Control',
    abnormal: 'Communication status abnormal, unable to control.',
    pending: 'Pending ...',
    error: 'Error!'
  },
  monitor: {
    monitor: 'Realtime Monitor',
    connecting: 'Connecting...',
    disconnected: 'Disconnected',
    no_video: 'Video source not found',
    fullscreen: 'Enter fullscreen',
    exit_fullscreen: 'Exit fullscreen'
  },
  depot: {
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
      air_reset: 'Reset',
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
      caption: 'Radar precipitation intensity',
    },
    now: 'Now',
    min_before: '1 min. before',
    feel: 'Weather',
    hum: 'Hum',
    temp: 'Tem',
    clear_day: 'Sunny',
    clear_night: 'Sunny',
    partly_cloudy: 'Partly cloudy',
    cloudy: 'Cloudy',
    rainy: 'Rain',
    snowy: 'Snow',
    windy: 'Wind',
    haze: 'Haze',
    alert: {
      '01': 'Typhoon',
      '02': 'Rainstorm',
      '03': 'Blizzard',
      '04': 'Cold',
      '05': 'Gale',
      '06': 'Sandstorm',
      '07': 'High Temp',
      '08': 'Arid',
      '09': 'Thunder',
      '10': 'Hail',
      '11': 'Frost',
      '12': 'Fog',
      '13': 'Haze',
      '14': 'Road Icing',
      '15': 'Forest Fire',
      '16': 'Thunderstorm',
    }
  },
  map: {
    waypoint: 'Waypoint',
    satellite: 'Satellite Map',
    clear: 'Clear Track',
    follow: 'Follow',
    fit: 'Fit',
    manual: 'Manual'
  },
  preflight: {
    title: 'Preflight Check',
    drone: 'UAV',
    depot: 'Depot',
    no_drone: 'Drone Not Found',
    no_depot: 'Depot Not Found',
    realtime: 'Realtime Weather',
    wind: 'Wind speed {n}m/s',
    wind_absent: 'Wind speed data absent',
    rain: 'Rainfall {n}',
    forecast: 'Weather Forecast',
    intensity: 'Radar precipitation intensity {n}',
    distance: 'Nearest precipitation zone {n}km',
    no_precipitation: 'No precipitation nearby',
    confirm: 'Confirm Run',
    slide2confirm: 'Slide to Run Plan'
  },
  debug: {
    title: 'Debug',
    send: 'Send'
  }
};
