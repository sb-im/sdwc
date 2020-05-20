export const NodeStatusClass = {
  // front-end only: preflight precheck failed
  '-3': 'el-icon-error color--red',
  // front-end only: dummy status in preflight, node doesn't exist
  '-2': 'el-icon-question color--gery',
  // front-end only: initial value in store, haven't connected
  '-1': 'el-icon-warning color--orange',
  // normal
  0: 'el-icon-success color--green',
  // powered off
  1: 'el-icon-info color--gery',
  // network error
  2: 'el-icon-error color--red'
};

export function getNodeStatusClass(status) {
  return NodeStatusClass[status];
}
