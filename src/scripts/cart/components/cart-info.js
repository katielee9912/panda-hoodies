(() => {
  if (
    typeof window.customElements.get('cart-count') !== 'undefined' ||
    typeof window.customElements.get('cart-total') !== 'undefined' ||
    typeof window.customElements.get('cart-original-total') !== 'undefined' ||
    typeof window.customElements.get('cart-discounts') !== 'undefined'
  ) { return }

  window.customElements.define('cart-count', class CartCount extends HTMLElement { // eslint-disable-line
    constructor () {
      super()
      window.addEventListener('cartAPI', ({ detail: { cartData } }) => {
        if (cartData.item_count === 0) {
          this.innerHTML = cartData.item_count
          return 0
        }

        const childBundleItemsCount = cartData.items
          .filter(item => typeof item.properties?._child_bundle_product !== 'undefined')
          .reduce((pres, cur) => pres + cur.quantity, 0)

        const softBundlesList = []
        const childSoftBundleItemsCount = cartData.items
          .filter(item => typeof item.properties?._child_soft_bundle !== 'undefined')
          .reduce((pres, cur) => {
            if (!softBundlesList.includes(cur.properties._child_soft_bundle)) {
              softBundlesList.push(cur.properties._child_soft_bundle)
              return pres
            }
            return pres + cur.quantity
          }, 0)

        this.innerHTML = cartData.item_count - childBundleItemsCount - childSoftBundleItemsCount
      })
    }
  })

  window.customElements.define('cart-total', class CartTotal extends HTMLElement { // eslint-disable-line
    constructor () {
      super()
      window.addEventListener('cartAPI', ({ detail: { cartData } }) => {
        this.innerHTML = Shopify.formatMoney(cartData.total_price)
      })
    }
  })

  window.customElements.define('cart-discounts', class CartDiscounts extends HTMLElement { // eslint-disable-line
    constructor () {
      super()
      window.addEventListener('cartAPI', ({ detail: { cartData } }) => {
        this.innerHTML = Shopify.formatMoney(cartData.total_discount)
      })
    }
  })
})()
