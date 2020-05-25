/**
 * @param {HTMLElement} root
 * @param {string} selector
 * @param {boolean} exist
 * @returns {Promise<HTMLElement>}
 */
export function waitSelector(root, selector, exist = true) {
  return new Promise(resolve => {
    const callback = () => {
      const q = root.querySelector(selector);
      return (exist === !!q) ? resolve(q) : requestAnimationFrame(callback);
    };
    requestAnimationFrame(callback);
  });
}
