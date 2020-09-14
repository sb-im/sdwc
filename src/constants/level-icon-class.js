export const LevelIconClass = {
  success: 'el-icon-success color--green',
  primary: 'el-icon-circle-plus color--blue',
  info: 'el-icon-info color-gery',
  warning: 'el-icon-warning color--orange',
  danger: 'el-icon-remove color--red',
  error: 'el-icon-error color--grey',
  unknown: 'el-icon-question color--grey'
};

export function getLevelIconClass(level) {
  return LevelIconClass[level] || LevelIconClass.unknown;
}
