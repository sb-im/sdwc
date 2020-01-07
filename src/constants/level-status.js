import i18n from '@/i18n';

// general levels
export const Levels = {
  success: 'success',
  primary: 'primary',
  warning: 'warning',
  danger: 'danger',
  error: 'error'
};

export const LevelColors = {
  success: '#67c23a',  // green
  primary: '#409eff',  // blue
  warning: '#e6a23c',  // orange
  danger: '#f56c6c',   // red
  error: '#606266'     // grey
};

// drone/depot status
export function getStatusText(status) {
  switch (status) {
    case 0: return i18n.t('header.normal');
    case 1: return i18n.t('header.shutdown');
    case 2: return i18n.t('header.net_error');
    default: return i18n.t('header.never_online');
  }
}

export const StatusIcon = {
  0: 'el-icon-success',
  1: 'el-icon-info',
  2: 'el-icon-error',
  default: 'el-icon-warning'
};

export const StatusColor = {
  0: '#67C23A',
  1: '#909399',
  2: '#F56C6C',
  default: '#E6A23C'
};

// preflight check status
export const StatusClass = {
  0: 'el-icon-success sd-preflight-green',
  1: 'el-icon-info sd-preflight-grey',
  2: 'el-icon-error sd-preflight-red',
  3: 'el-icon-error sd-preflight-grey'
};

export const LevelClass = {
  success: 'el-icon-success sd-preflight-green',
  primary: 'el-icon-circle-plus sd-preflight-blue',
  warning: 'el-icon-warning sd-preflight-orange',
  danger: 'el-icon-remove sd-preflight-red',
  error: 'el-icon-error sd-preflight-grey'
};
