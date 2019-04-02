import wretch from 'wretch';

let wr = wretch();

export function setBaseURL(url = '') {
  wr = wretch(url.replace(/\/$/, ''));
}

export function config() {
  return wr.url('/config.json')
    .get()
    .json();
}
