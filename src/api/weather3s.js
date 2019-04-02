import wretch from 'wretch';

let wr = wretch();

export function setBaseURL(url = '') {
  wr = wretch(url.replace(/\/$/, ''));
}

export function get(id = '') {
  return wr.url(`/get/${id}`)
    .get()
    .json();
}
