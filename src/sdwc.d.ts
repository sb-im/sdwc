declare namespace SDWC {
  /// global helpers
  export type EachReturnType<T> = {
    [P in keyof T]: T[P] extends ((...args: any[]) => any) ? ReturnType<T[P]> : T[P];
  }

  /// Vuex store state modules
  // store/modules/config.js
  export interface Config {
    super_dock_api_server: string;
    oauth_client_id: string;
    oauth_client_secret: string;
    lang: string;
    amap_key: string;
    gmap_key: string;
    caiyun_key: string;
    mqtt_url: string;
  }

  // store/modules/node.js
  export interface NodePoint {
    id: number;
    name: string;
    params: Record<string, any>;
    node_id: number;
    point_type_id: number;
    point_type_name: string;
    created_at: string;
    updated_at: string;
  }
  export interface NodeInfo {
    id: number;
    name: string;
    type_name: 'air' | 'depot';
    description: string;
    points: NodePoint[];
  }
  export interface NodeConnectionStatus {
    code: number;
    msg: string;
    status: {
      link_id: number;
      position_ok: boolean;
      lat: string;
      lng: string;
      alt: string;
    };
  }
  export interface NodeWeatherData {
    WD: number;
    WS: number;
    T: number;
    RH: number;
    Pa: number;
  }
  export interface NodeWeather {
    time: number;
    data: NodeWeatherData;
  }
  export interface NodeBattery {
    id: string;
    /** Temperature [°C] */
    temp: number;
    /** Capacity [mA*h] */
    cap: number;
    /** current [mA] If Charging */
    cur: string;
    /** remaining battery [%] */
    remain: number;
    /** Cycles */
    cycle: number;
    /** Cell voltage [mV], eg `'3941/3948/3944/3945/3943/3942'` */
    vol_cell: string;
    status: string[];
    /** Unknown */
    bal: number;
  }
  export interface NodeDroneStatus {
    status: 'standby' | 'flying' | 'error';
    mode: 'auto' | 'guide' | 'rtl' | 'land' | 'loiter';
    /** flight time [s] */
    time: number;
    /** Ground speed [m/s] */
    speed: number;
    /** Relative height at the takeoff point */
    height: number;
    gps: {
      type: 'NO_GPS' | 'NO_FIX' | '2D_FIX' | '3D_FIX' | 'DGPS' | 'RTK_FLOAT' | 'RTK_FIX';
      /** GPS satellites count */
      satcount: number;
    };
    battery: {
      /** 1-100 [%] */
      percent: number;
      /** voltage [v] */
      voltage: number;
    };
    /** Signal strength 1-100 [%] */
    signal: number;
  }
  export interface NodeGimbal {
    mode: string;
    yaw: number;
    pitch: number;
  }
  export interface NodePosition {
    /** Latitude */
    lat: string;
    /** Longitude */
    lng: string;
    /** Altitude */
    alt: string;
    /** Heading 0°~360° */
    heading: number;
  }
  export interface NodeNotification {
    time: string;
    /** 1: Debug, 2: Info, 3: Warn, 4: Error, 5: Fatal, 6: Panic */
    level: number;
    msg: string;
  }
  export interface Node {
    info: NodeInfo;
    /** connection status */
    status: NodeConnectionStatus;
    msg: {
      weather: NodeWeather[];
      battery: NodeBattery;
      drone_status: NodeDroneStatus;
      gimbal: NodeGimbal;
      position: NodePosition[];
      notification: NodeNotification[];
    };
  }
  export type RawNodeMessage = Partial<{
    weather: NodeWeatherData;
    battery: NodeBattery;
    drone_status: NodeDroneStatus;
    gimbal: NodeGimbal;
    position: NodePosition;
    notification: NodeNotification;
  }>
  /**
   * interface won't work here
   */
  export type NodeMessageLegacy = Partial<{
    [key in 'status' | 'heartbeat']: {
      [key in 'battery' | 'flight' | 'gps' | 'mount']: {
        [key: string]: NodeMessageLegacy
      }
    }
  }>

  // store/modules/notitication.js
  export interface NotificationItem {
    id: string;
    time: number;
    prefix: string;
    title: string;
    status: number;
  }

  // store/modules/plan.js
  export interface PlanInfo {
    id: number;
    name: string;
    description: string;
    node_id?: number;
    depot_id?: number;
    cycle_types_id: number;
    map_path: string;
    created_at: string;
    updated_at: string;
  }
  export interface PlanLog {
    id: number;
    plan_id: number;
    raw_data?: string;
    orthomosaic_path?: string;
    air_log_path?: string;
    sever_log_path?: string;
    created_at: string;
    updated_at: string;
  }

  // store/modules/preference.js
  export interface Preference {
    mapType: string;
    mapFollow: boolean;
    overviewFit: boolean;
    lang: string;
  }

  // store/modules/user.js
  export interface User {
    id: number;
    email: string;
    token: string;
    due: number;
  }

  export interface State {
    config: Config;
    node: Node[];
    notification: NotificationItem[];
    plan: {
      info: PlanInfo[];
      log: PlanLog[];
    }
    preference: Preference;
    user: User;
  }

  /// types in components
  // components/control.vue
  type ButtonType = 'primary' | 'success' | 'warning' | 'danger' | 'info';
  export interface ControlItem {
    /** mission name */
    mission: string;
    /** mission arguments. default: `[]` */
    arg?: any;
  }
  export interface ControlButton extends ControlItem {
    /** `vue-i18n` string name */
    name: string;
    /** `vue-i18n` string values */
    values?: any;
    /** display button type. default: `warning` */
    type?: ButtonType;
  }

  // components/map.vue
  interface MarkerBase {
    id: number | string;
    position: { lng: number; lat: number };
    name: string;
  }
  export interface MarkerAction extends MarkerBase {
    type: 'action';
    action: string[];
  }
  export interface MarkerDepot extends MarkerBase {
    type: 'depot';
  }
  export interface MarkerDrone extends MarkerBase {
    type: 'drone';
    heading: number;
  }
  export type Marker = MarkerAction | MarkerDepot | MarkerDrone;

  export interface MqttControlOptions {
    /** send as JSONRPC Notification */
    notification?: boolean;
  }
}
