// @ts-check

/**
 * @param {SDWC.State} state
 * @returns {boolean}
 */
export function authenticated(state) {
  const { token, due } = state.user;
  return token.length > 0 && due > Date.now();
}

/**
 * @param {SDWC.State} state
 * @returns {SDWC.Node[]}
 */
export function depots(state) {
  return state.node.filter(node => node.info.type_name === 'depot');
}

/**
 * @param {SDWC.State} state
 * @returns {SDWC.Node[]}
 */
export function drones(state) {
  return state.node.filter(node => node.info.type_name === 'air');
}
