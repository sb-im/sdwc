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
  export interface NodePosition {
    lat: number;
    lng: number
  }
  export interface NodeWeather {
    WD: number;
    WS: number;
    T: number;
    RH: number;
    Pa: number;
  }
  export interface WeatherRecord {
    time: number;
    weather: NodeWeather;
  }
  export interface Node {
    info: NodeInfo;
    status: number;
    msg: any;
    log: string[];
    position: NodePosition;
    path: NodePosition[];
    weatherRec: WeatherRecord[];
  }

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
