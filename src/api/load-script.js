import { h } from '@/util/create-element';

const promises = {};

/**
 * load script src, optionally run initFn() and return variable
 * @param {string} src
 * @param {string} variable
 * @param {string | Function} initFn
 * @returns {Promise<any>}
 */
export function loadScript(src, variable, initFn) {
  if (window[variable]) return Promise.resolve(window[variable]);
  if (promises[variable]) return promises[variable];
  const script = h('script', { src });
  promises[variable] = new Promise((resolve, reject) => {
    script.onload = () => {
      if (typeof initFn == 'function') initFn(window[variable]);
      else if (typeof window[initFn] === 'function') window[initFn]();
      resolve(window[variable]);
    };
    script.onerror = () => {
      reject();
      delete promises[variable];
      document.head.removeChild(script);
    };
    document.head.appendChild(script);
  });
  return promises[variable];
}
