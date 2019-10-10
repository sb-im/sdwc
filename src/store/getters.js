// @ts-check

/**
 * @param {SDWC.State} state
 */
export function depots(state) {
  return state.node.filter(node => node.info.type_name === 'depot');
}

/**
 * @param {SDWC.State} state
 */
export function drones(state) {
  return state.node.filter(node => node.info.type_name === 'air');
}
