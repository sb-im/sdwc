declare namespace SDWC {
  /// global helpers
  export type EachReturnType<T> = {
    [P in keyof T]: T[P] extends ((...args: any[]) => any) ? ReturnType<T[P]> : T[P];
  }

  export interface LatLng {
    lat: number;
    lng: number;
  }

  export interface ParsedWaypoint {
    boundary?: LatLng[];
    path: LatLng[];
    actions: MarkerAction[];
  }

  /// Vuex store state modules
  // store/modules/config.js
  export interface Config {
    beian: string;
    title: string;
    aside_logo: string;
    super_dock_api_server: string;
    lang: string;
    ice_server?: string;
    ice_servers?: RTCIceServer[];
    map_tiles_url: string;
    caiyun_key: string;
    heweather_key: string;
  }

  // store/modules/node.js
  export interface NodePoint {
    id: number;
    type: string;
    name: string;
    params: any;
    node_id: number;
  }
  export interface NodeInfo {
    id: number;
    name: string;
    points: NodePoint[];
  }
  export interface NodeConnectionStatus {
    code: number;
    msg: string | 'online' | 'offline' | 'neterror';
    status: {
      link_id: number;
      lat: string;
      lng: string;
      alt: string;
      type?: 'drone' | 'depot';
    };
    timestamp: string;
  }
  export interface NodeNetworkStatus {
    /** (0 ~ 100)% */
    loss: number;
    /** Delay [ms] */
    delay: number;
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
    yaw: number;
    pitch: number;
    zoom: number;
    source: string;
  }
  export interface NodeDroneScreenSection {
    button: {
      method: string;
      name: string;
      params?: any;
    }[];
    now: string;
  }
  export type NodeActionEnabled = string[];
  export interface NodeOverlayScreenShape {
    type: string;
    x: number;
    y: number;
    r?: number;
    rx?: number;
    ry?: number;
    width?: number;
    height?: number;
    fill?: string;
    stroke?: string;
    'stroke-width'?: number;
    label?: string;
  }
  export interface NodeOverlayScreen {
    width: number;
    height: number;
    shapes: NodeOverlayScreenShape[];
  }
  export interface GPSCoordinate {
    /** Latitude */
    lat: number;
    /** Longitude */
    lng: number;
    /** Altitude (Optional) */
    alt?: number;
    /** Height (Optional) */
    height?: number;
  }
  export interface NodePosition extends GPSCoordinate {
    /** Heading 0°~360° */
    heading: number;
  }
  export interface NodePlaces {
    [key: string]: GPSCoordinate;
  }
  export interface GPSHeatPoint {
    /** Latitude */
    lat: number;
    /** Longitude */
    lng: number;
    /** Point weight on heatmap */
    weight: number;
  }
  export type NodeHeatmap = GPSHeatPoint[];
  export interface NodeWaypoint {
    [key: string]: string;
  }
  export interface NodeNotification {
    time: string;
    /** 0: Emergency, 1: Alert, 2: Critical, 3: Error, 4: Warn, 5: Notice, 6: Info, 7: Debug */
    level: number;
    msg: string;
  }
  export interface NodeMsg {
    weather: NodeWeather;
    battery: NodeBattery;
    charger: NodeCharger;
    depot_status: NodeDepotStatus;
    drone_status: NodeDroneStatus;
    gimbal: NodeGimbal;
    action_enabled: NodeActionEnabled;
    overlay_screen: NodeOverlayScreen;
    position: NodePosition[];
    place: NodePlaces;
    heatmap: NodeHeatmap;
    waypoint: NodeWaypoint;
    notification: NodeNotification[];
    overview: any;
  }
  export interface Node {
    info: NodeInfo;
    /** connection status */
    status: NodeConnectionStatus;
    network: NodeNetworkStatus;
    msg: NodeMsg;
  }
  export type RawNodeMessage = Partial<{
    weather: NodeWeather;
    battery: NodeBattery;
    charger: NodeCharger;
    depot_status: NodeDepotStatus;
    drone_status: NodeDroneStatus;
    gimbal: NodeGimbal;
    action_enabled: NodeActionEnabled;
    overlay_screen: NodeOverlayScreen;
    position: NodePosition;
    place: NodePlaces;
    heatmap: NodeHeatmap;
    waypoint: NodeWaypoint;
    notification: NodeNotification;
    overview: any;
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
  // PlanInfo
  export interface PlanInfo {
    id: number;
    name: string;
    /** run/jobs count */
    index: number;
    node_id: number;
    files: {
      waypoint?: string;
      speaker?: string;
      lua?: string;
      droneconfig?: string;
      [key: string]: string;
    };
    extra: {
      [key: string]: string;
    };
  }
  // PlanTerm
  export interface PlanTerm {
    id: number;
    output: PlanTermOutput[];
  }
  export interface PlanTermOutput {
    time: number;
    msg: string;
  }
  // PlanDialog
  export interface PlanDialogItem {
    name: string;
    message: string;
    level: LevelEnum;
  }
  export interface PlanDialogContent {
    name?: string;
    message?: string;
    level?: LevelEnum;
    items?: PlanDialogItem[];
    buttons?: PlanDialogItem[];
  }
  export interface PlanDialog {
    id: number;
    time: number;
    dialog: PlanDialogContent;
  }
  // PlanStatus
  export interface PlanStatusData {
    status: 'ready' | 'error' | 'protect' | 'running';
  }
  // PlanJob
  export interface PlanJob {
    id: number;
    /** job ordinal number */
    index: number;
    /** file name: blob id */
    files?: { [key: string]: string; };
    extra?: { [key: string]: string; };
    created_at: string;
    updated_at: string;
  }
  export interface RunningTask extends PlanInfo {
    /** running task id */
    job: PlanJob;
  }
  export interface PlanRunning {
    /** Plan Id */
    id: number;
    running: RunningTask;
  }
  // PlanLog
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
  export interface PlanState {
    info: PlanInfo[];
    term: PlanTerm[];
    dialog: PlanDialog[];
    running: PlanRunning[]
  }

  // store/modules/preference.js
  export interface Preference {
    lang: string;
    mapFollow: boolean;
    overviewFit: boolean;
    notifyNoPopup: number[];
    rpcMsgPopup: boolean;
    planDialogPopup: boolean;
  }

  // store/modules/ui.js
  export interface SidebarItem {
    icon: string;
    name: string;
    type: 'overview' | 'plan' | 'node' | 'path' | 'iframe';
    args: string;
  }

  export interface UI {
    mqttConnected: boolean;
    mqttDelay: number;
    sidebar: SidebarItem[];
  }

  // store/modules/user.js
  export interface User {
    info: ApiTypes.V3.User;
    credential: {
      implicit: boolean;
      token: string;
      expire: string;
    }
  }

  export interface State {
    config: Config;
    node: Node[];
    notification: NotificationItem[];
    plan: PlanState;
    preference: Preference;
    ui: UI;
    user: User;
  }

  export type LevelEnum = 'primary' | 'success' | 'warning' | 'danger' | 'info';

  /// types in components
  // components/control.vue
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
    type?: LevelEnum;
  }
  export interface ControlButtonGroup {
    icon: string;
    item: ControlButton[];
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
    style: DronePlaceStyle;
  }
  export type Marker = MarkerAction | MarkerDepot | MarkerDrone | MarkerPlace;
  export type DroneMapControlParamDescriptor = {
    type: 'string';
    required?: boolean;
    default?: string;
    unit?: string;
  } | {
    type: 'number';
    required?: boolean;
    default?: number;
    unit?: string;
  }
  export interface DroneMapControl {
    method: string;
    params?: {
      [key: string]: DroneMapControlParamDescriptor;
    }
  }
  export interface DronePlaceStyle {
    stroke?: 'dotted' | 'dashed' | 'solid';
    color?: string;
    point?: 'glow';
  }
  export interface MapPolyline {
    name: string;
    coordinates: GPSCoordinate[];
    style: DronePlaceStyle;
  }
  export interface PolylineDescriptor {
    data: GeoJSON.LineString;
    source: string;
    layers: string[];
  }

  // components/settings/settings.vue
  export interface SettingsItem {
    type: string;
    label: string;
    field: string;
    value?: any;
  }
  export interface SettingsGroup {
    name: string;
    method: string;
    topic: string;
    item: SettingsItem[];
  }

  // components/settings/node-parameters.vue
  export interface NodeParameterTypesRaw {
    [key: string]: {
      type: 'bool' | 'enum' | 'string' | 'float';
      type_param: any;
      label: string;
      description?: string?;
    }
  }
  export interface NodeParameterType {
    type: string;
    label: string;
    description: string;
  }

  // components/status/status-meter.vue
  export interface StatusItem {
    icon: string;
    name?: string;
    value: string;
    unit?: string;
    popover?: string;
  }

  // MqttClient
  export interface MqttTopicInfo {
    entity: 'nodes' | 'plans' | string;
    id: number;
    category: string;
    param: string;
  }
  export interface MqttRpcOptions {
    /** send as JSONRPC Notification */
    notification?: boolean;
  }
}
