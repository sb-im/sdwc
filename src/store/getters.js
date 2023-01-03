// @ts-check

/**
 * @param {SDWC.State} state
 * @returns {boolean}
 */
export function authenticated(state) {
  const { implicit, token, expire } = state.user.credential;
  return implicit || (token.length > 0 && new Date(expire).getTime() > Date.now());
}

/**
 * @param {SDWC.State} state
 * @returns {SDWC.Node[]}
 */
export function depots(state) {
  return state.node.filter(n => n.status.status.type === 'depot');
}

/**
 * @param {SDWC.State} state
 * @returns {SDWC.Node[]}
 */
export function drones(state) {
  return state.node.filter(n => n.status.status.type === 'drone');
}
