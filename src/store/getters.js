// @ts-check

/**
 * @typedef {import('./index').State} State
 * @typedef {import('./util').EachReturnType<typeof import('./getters')>} Getters
 */

/**
 * @param {State} state
 */
export function depots(state) {
  return state.node.filter(node => node.info.type_name === 'depot');
}

/**
 * @param {State} state
 */
export function drones(state) {
  return state.node.filter(node => node.info.type_name === 'air');
}
