/**
 * fill attributes and children
 * @template {Element} T
 * @param {T} elm
 * @param {Record<string, string>} attrs
 * @param {Element[] | string} [children]
 * @returns {T}
 */
function setupElement(elm, attrs, children) {
  if (attrs) {
    for (const [name, value] of Object.entries(attrs)) {
      elm.setAttribute(name, value);
    }
  }
  if (children) {
    if (typeof children === 'string') {
      elm.append(children);
    } else if (Array.isArray(children)) {
      for (const child of children) {
        elm.append(child);
      }
    }
  }
  return elm;
}

/**
 * create HTML Element
 * @param {keyof HTMLElementTagNameMap} tag
 * @param {Record<string, string>} attrs
 * @param {Element[] | string} [children]
 * @returns {HTMLElement}
 */
export function h(tag, attrs, children) {
  const elm = document.createElement(tag);
  return setupElement(elm, attrs, children);
}

/**
 * create SVG Element
 * @param {keyof SVGElementTagNameMap} tag
 * @param {Record<string, string>} attrs
 * @param {Element[] | string} [children]
 * @returns {SVGElement}
 */
export function hs(tag, attrs, children) {
  const elm = document.createElementNS('http://www.w3.org/2000/svg', tag);
  return setupElement(elm, attrs, children);
}
