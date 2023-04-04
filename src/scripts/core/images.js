customElements.define("theme-image", class ThemeImage extends HTMLElement { // eslint-disable-line
  constructor () {
    super()

    this.imgEl = this.querySelector('img')
  }

  connectedCallback () {
    if (this.imgEl.offsetWidth > 0) {
      this.imgEl.setAttribute('sizes', `${this.imgEl.offsetWidth}px`)
    }

    if (!this.imgEl.hasAttribute('data-srcset')) { return }

    this.imgEl.setAttribute('srcset', this.imgEl.getAttribute('data-srcset'))
    this.imgEl.removeAttribute('data-srcset')
  }
})
