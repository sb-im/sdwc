import wretch from 'wretch';

let wr = wretch();

export function setBaseURL(url = '') {
  wr = wr.url(url.replace(/\/$/, ''), true);
}

/**
 * @param {string} id
 * @returns {Promise<import('./api-types').Weather3sResult>}
 */
export function get(id = '') {
  return wr.url(id, /^https?:/.test(id))
    .get()
    .json();
}
