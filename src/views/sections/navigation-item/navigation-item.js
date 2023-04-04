import './navigation-item.scss'

;(() => {
  if (typeof window.customElements.get('navigation-item') !== 'undefined') { return }

  window.customElements.define('navigation-item', class MegaMenu extends HTMLElement { // eslint-disable-line
    constructor () {
      super()

      const parent = this.parentElement
      const li = document.createElement('li')
      li.classList.add('megamenu-navitem')
      li.setAttribute('role', 'menuitem')
      li.replaceChildren(this)
      parent.replaceWith(li)
    }
  })
})()
