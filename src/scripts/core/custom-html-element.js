/**
 *
 * @param { string } customElemTag
 * @param { class extends HTMLElement } customElmClass
 * @returns customElmClass
 *
  ----------------------------------------------------------------------
  USAGE
  ----------------------------------------------------------------------
  newCustomElement('custom-element-tag', class extends HTMLElement {
    constructor () {
      super()
      // Your Code Goes Here
    }
  })
  */

const newCustomElement = (customElemTag, customElmClass) => {
  if (typeof window.customElements.get(customElemTag) !== 'undefined') { return null }
  window.customElements.define(customElemTag, customElmClass)
  return customElmClass
}

export default newCustomElement
