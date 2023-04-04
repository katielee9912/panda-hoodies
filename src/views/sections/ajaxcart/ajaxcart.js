(() => {
  if (typeof window.customElements.get('ajax-cart') !== 'undefined') { return }

  window.customElements.define('ajax-cart', class Ajaxcart extends HTMLElement { // eslint-disable-line
    constructor () {
      super()
      this.open = false
      this.itemsInCart = null
      this.siteOverlay = document.querySelector('[data-site-overlay]')
      this.drawerPopup = this.closest('popup-element')
      this.initToggles()
    }

    initToggles () {
      window.addEventListener('cartAPI', ({ detail: { cartData } }) => {
        if (this.itemsInCart !== null && this.itemsInCart < cartData.item_count) {
          this.openAjaxcart()
        }

        this.itemsInCart = cartData.item_count
        this.freeGiftBar(cartData)
      })

      window.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape' || this.open === false) { return }
        this.closeAjaxcart()
      })

      document.querySelectorAll('[data-close-ajaxcart]').forEach((toggle) => {
        toggle.addEventListener('click', () => {
          this.closeAjaxcart()
        })
      })

      if (window.location.href.split('?')[1]?.includes('cart_redirect')) {
        this.openAjaxcart()
      }

      if (this.siteOverlay !== null) {
        this.siteOverlay.addEventListener('click', () => {
          this.closeAjaxcart()
        })
      }
    }

    openAjaxcart () {
      this.drawerPopup.open = true
    }

    closeAjaxcart () {
      this.drawerPopup.open = false
    }

    freeGiftBar (cartData) {
      const fsb = this.querySelector('[data-fsb]')
      if (!fsb) { return }

      const threshold = parseInt(fsb.getAttribute('data-fsb'), 10) * 100
      const bar = this.querySelector('[data-fsb-bar]')
      const text = this.querySelector('[data-fsb-text]')

      if (bar !== null) {
        const barPercent = (cartData.total_price / threshold) * 100
        bar.style.width = `${barPercent > 100 ? 100 : barPercent}%`
      }

      if (text !== null) {
        text.innerHTML = cartData.total_price >= threshold
          ? text.getAttribute('data-qualified-text')
          : text.getAttribute('data-unqualified-text')
            .replace(/\[amount\]/g, Shopify.formatMoney(threshold - cartData.total_price))
      }
    }
  })
})()
