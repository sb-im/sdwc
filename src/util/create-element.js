/**
 * create HTML Element
 * @param {keyof HTMLElementTagNameMap} tag
 * @param {Record<string, string>} attrs
 * @param {HTMLElement} children
 */
export function h(tag, attrs, children) {
  const elm = document.createElement(tag);
  if (attrs) {
    for (const [name, value] of Object.entries(attrs)) {
      elm.setAttribute(name, value);
    }
  }
  if (children) {
    elm.append(...children);
  }
  return elm;
}

/**
 * create SVG Element
 * @param {keyof SVGElementTagNameMap} tag
 * @param {Record<string, string>} attrs
 * @param {SVGElement} children
 */
export function hs(tag, attrs, children) {
  const elm = document.createElementNS('http://www.w3.org/2000/svg', tag);
  if (attrs) {
    for (const [name, value] of Object.entries(attrs)) {
      elm.setAttribute(name, value);
    }
  }
  if (children) {
    elm.append(...children);
  }
  return elm;
}
