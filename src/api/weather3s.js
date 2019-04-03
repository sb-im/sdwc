import wretch from 'wretch';

let wr = wretch();

export function setBaseURL(url = '') {
  wr = wr.url(url.replace(/\/$/, ''), true);
}

export function get(id = '') {
  return wr.url(`/get/${id}`)
    .get()
    .json();
}
