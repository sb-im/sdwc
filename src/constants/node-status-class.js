export const NodeStatusClass = {
  // front-end only: initial value in store
  '-1': 'el-icon-warning color--orange',
  // normal
  0: 'el-icon-success color--green',
  // powered off
  1: 'el-icon-info color--gery',
  // network error
  2: 'el-icon-error color--red',
  // front-end only: dummy status in preflight
  3: 'el-icon-question color--gery'
};

export function getNodeStatusClass(status) {
  return NodeStatusClass[status];
}
