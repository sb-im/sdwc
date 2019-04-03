import wretch from 'wretch';

let wr = wretch();

export function setBaseURL(url = '') {
  wr = wr.url(url.replace(/\/$/, ''), true);
}

export function config() {
  return wr.url('/config.json')
    .get()
    .json();
}
