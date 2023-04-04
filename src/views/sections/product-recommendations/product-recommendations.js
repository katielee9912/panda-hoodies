// Import CSS
import './product-recommendations.scss'

(() => {
  if (typeof window.customElements.get('product-recommendations') !== 'undefined') { return }

  class ProductRecommendations extends HTMLElement {
    constructor () {
      super()

      this.productsContainer = this.querySelector('[data-reco-products-container]')
      this.init()
    }

    init () {
      if (!this.dataset.url) { return }

      fetch(this.dataset.url)
        .then(response => response.text())
        .then(text => {
          const parser = new window.DOMParser()
          const html = parser.parseFromString(text, 'text/html')
          const recommendations = html.querySelector('[data-reco-products-container]')
          if (recommendations && recommendations.innerHTML.trim().length) {
            this.productsContainer.innerHTML = recommendations.innerHTML
          }
        })
        .catch(error => {
          console.error(error)
        })
    }
  }

  window.customElements.define('product-recommendations', ProductRecommendations)
})()
