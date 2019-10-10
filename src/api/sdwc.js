import wretch from 'wretch';

let wr = wretch();

export function setBaseURL(url = '') {
  wr = wr.url(url.replace(/\/$/, ''), true);
}

let confProm;
/** @returns {Promise<SDWC.Config>} */
export function config() {
  if (confProm) return confProm;
  return confProm = wr.url('/config.json')
    .get()
    .json();
}
