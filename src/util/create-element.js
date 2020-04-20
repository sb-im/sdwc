/**
 * fill attributes and children
 * @param {Element} elm
 * @param {Record<string, string>} attrs
 * @param {HTMLElement} children
 */
function setupElement(elm, attrs, children) {
  if (attrs) {
    for (const [name, value] of Object.entries(attrs)) {
      elm.setAttribute(name, value);
    }
  }
  if (children) {
    for (const child of children) {
      if (typeof child === 'string') {
        elm.appendChild(document.createTextNode(child));
      } else if (child instanceof Node) {
        elm.appendChild(child);
      }
    }
  }
  return elm;
}

/**
 * create HTML Element
 * @param {keyof HTMLElementTagNameMap} tag
 * @param {Record<string, string>} attrs
 * @param {HTMLElement} children
 */
export function h(tag, attrs, children) {
  const elm = document.createElement(tag);
  return setupElement(elm, attrs, children);
}

/**
 * create SVG Element
 * @param {keyof SVGElementTagNameMap} tag
 * @param {Record<string, string>} attrs
 * @param {SVGElement} children
 */
export function hs(tag, attrs, children) {
  const elm = document.createElementNS('http://www.w3.org/2000/svg', tag);
  return setupElement(elm, attrs, children);
}
