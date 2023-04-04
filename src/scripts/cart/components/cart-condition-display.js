(() => {
  if (
    typeof window.customElements.get('hide-if-cart-empty') !== 'undefined' ||
    typeof window.customElements.get('show-if-cart-empty') !== 'undefined' ||
    typeof window.customElements.get('show-if-cart-over') !== 'undefined'
  ) { return }

  window.customElements.define('hide-if-cart-empty', class HideIfCartEmpty extends HTMLElement { // eslint-disable-line
    constructor () {
      super()
      window.addEventListener('cartAPI', ({ detail: { cartData } }) => {
        this.classList.toggle('hide', cartData.item_count === 0)
      })
    }
  })

  window.customElements.define('show-if-cart-empty', class ShowIfCartEmpty extends HTMLElement { // eslint-disable-line
    constructor () {
      super()
      window.addEventListener('cartAPI', ({ detail: { cartData } }) => {
        this.classList.toggle('hide', cartData.item_count !== 0)
      })
    }
  })

  window.customElements.define('show-if-cart-over', class ShowIfCartOver extends HTMLElement { // eslint-disable-line
    constructor () {
      super()
      window.addEventListener('cartAPI', ({ detail: { cartData } }) => {
        this.classList.toggle('hide', cartData.total_price < (parseInt(this.getAttribute('data-threshold'), 10) * 100))
      })
    }
  })

  window.customElements.define('show-if-cart-discounts', class ShowIfCartDiscounts extends HTMLElement { // eslint-disable-line
    constructor () {
      super()
      window.addEventListener('cartAPI', ({ detail: { cartData } }) => {
        this.classList.toggle('hide', (cartData.total_discount !== null && cartData.total_discount === 0))
      })
    }
  })
})()
