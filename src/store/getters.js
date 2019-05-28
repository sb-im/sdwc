// @ts-check

/**
 * @typedef {import('./index').State} State
 * @typedef {import('./util').EachReturnType<typeof import('./getters')>} Getters
 */

/**
 * @param {State} state
 */
export function depots(state) {
  return state.node.info.filter(node => node.type_name === 'depot');
}

/**
 * @param {State} state
 */
export function drones(state) {
  return state.node.info.filter(node => node.type_name === 'air');
}
