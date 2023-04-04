import cartAPI from '@scripts/cart/cart-api'

(() => {
  if (typeof window.customElements.get('cart-note') !== 'undefined') { return }

  window.customElements.define('cart-note', class CartNote extends HTMLElement { // eslint-disable-line
    constructor () {
      super()
      this.input = this.querySelector('[data-note-input]')
      this.initNote()
    }

    initNote () {
      if (!this.input) { return }

      let saveTimeout = null
      this.input.addEventListener('keyup', () => {
        if (saveTimeout !== null) { clearTimeout(saveTimeout) }
        saveTimeout = setTimeout(() => {
          this.saveNote()
        }, 500)
      })

      this.input.addEventListener('blur', () => {
        this.saveNote()
      })

      window.addEventListener('cartAPI', ({ detail: { cartData } }) => {
        if (this.input.value === cartData.note || this.input.value.length !== 0) { return }
        this.input.value = cartData.note === null ? '' : cartData.note
      })
    }

    saveNote () {
      cartAPI.cartUpdate({ note: this.input.value })
    }
  })
})()
