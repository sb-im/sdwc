declare namespace SDWC {
  /// global helpers
  export type EachReturnType<T> = {
    [P in keyof T]: T[P] extends ((...args: any[]) => any) ? ReturnType<T[P]> : T[P];
  }

  export interface LatLng {
    lat: number;
    lng: number;
  }

  /// Vuex store state modules
  // store/modules/config.js
  export interface Config {
    beian: string;
    super_dock_api_server: string;
    oauth_client_id: string;
    oauth_client_secret: string;
    lang: string;
    amap_key: string;
    gmap_key: string;
    caiyun_key: string;
    mapbox_key: string;
    mqtt_url: string;
  }

  // store/modules/node.js
  export interface NodePoint {
    id: number;
    name: string;
    params: {
      [key: string]: any;
    };
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
    /** needs `ncp status` to retrieve status */
    legacy?: boolean;
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
  export interface NodeWeather {
    /** wind speed */
    WS: number;
    /** Wind Direction (0 ~ 360) ° */
    WD?: number;
    /**Temperature Kelvin [K]. **Priority: (T > t > F)** */
    T?: number;
    /** Temperature Celsius [°C] */
    t?: number;
    /** Temperature Fahrenheie [°F] */
    F?: number;
    /** Relative humidity (0 ~ 99)％ */
    RH?: number;
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
  export interface NodeCharger {
    status: 'ready' | 'running' | 'protect' | 'error';
    V: number;
    A: number;
  }
  export interface NodeDepotStatus {
    status: 'ready' | 'running' | 'protect' | 'error';
    power: 'cable' | 'ups' | 'solar';
    door: 'opened' | 'moving' | 'closed';
    fix: 'opened' | 'moving' | 'closed';
  }
  export interface NodeDroneStatus {
    status: 'standby' | 'flying' | 'error';
    mode: 'auto' | 'guide' | 'rtl' | 'land' | 'loiter' | 'unknown';
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
  export interface GPSCoordinate {
    /** Latitude */
    lat: number;
    /** Longitude */
    lng: number;
    /** Altitude */
    alt: number;
  }
  export interface GPSHeatPoint {
    /** Latitude */
    lat: number;
    /** Longitude */
    lng: number;
    /** Point weight on heatmap */
    weight: number;
  }
  export interface NodePosition extends GPSCoordinate {
    /** Heading 0°~360° */
    heading: number;
    place: {
      [key: string]: GPSCoordinate | GPSCoordinate[];
    };
    heatmap: {
      [key: string]: GPSHeatPoint[];
    };
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
      weather: NodeWeather;
      battery: NodeBattery;
      charger: NodeCharger;
      depot_status: NodeDepotStatus;
      drone_status: NodeDroneStatus;
      gimbal: NodeGimbal;
      position: NodePosition[];
      notification: NodeNotification[];
      overview: any;
    };
  }
  export type RawNodeMessage = Partial<{
    weather: NodeWeather;
    battery: NodeBattery;
    charger: NodeCharger;
    depot_status: NodeDepotStatus;
    drone_status: NodeDroneStatus;
    gimbal: NodeGimbal;
    position: NodePosition;
    notification: NodeNotification;
    overview: any;
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
    lang: string;
    mapType: string;
    mapFollow: boolean;
    overviewFit: boolean;
    notifyPopup: number[];
  }

  // store/modules/ui.js
  export interface UI {
    mqttConnected: boolean;
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
  export interface MarkerPlace extends MarkerBase {
    type: 'place';
  }
  export type Marker = MarkerAction | MarkerDepot | MarkerDrone | MarkerPlace;
  export type DroneMapControlParamDescriptor = {
    type: 'string';
    required?: boolean;
    default?: string;
  } | {
    type: 'number';
    required?: boolean;
    default?: number;
  }
  export interface DroneMapControl {
    method: string;
    params?: {
      [key: string]: DroneMapControlParamDescriptor;
    }
  }
  export interface DroneMapStyling {
    stroke?: 'dotted' | 'dashed' | 'solid';
    color?: string;
    point?: 'glow';
  }

  export interface MqttControlOptions {
    /** send as JSONRPC Notification */
    notification?: boolean;
  }
}
