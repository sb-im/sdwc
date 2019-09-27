declare namespace SDWC {
  import { ButtonType } from 'element-ui/types/button';
  export interface ControlItem {
    /** `vue-i18n` string name */
    name: string;
    /** `vue-i18n` string values */
    values?: any;
    /** mission name */
    mission: string;
    /** mission arguments. default: `[]` */
    arg?: any;
    /** display button type. default: `warning` */
    type?: ButtonType;
  }

  interface MarkerBase {
    id: number;
    position: { lng: number; lat: number };
    name: string;
  }
  export interface MarkerDepot extends MarkerBase {
    type: 'depot';
  }
  export interface MarkerDrone extends MarkerBase {
    type: 'drone';
    heading: number;
  }
  export type Marker = MarkerDepot | MarkerDrone;
}
