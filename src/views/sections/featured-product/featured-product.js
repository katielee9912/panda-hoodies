import './featured-product.scss'
// import { isScriptLoaded, markScriptLoaded } from '@scripts/core/loaded'
import AccessibleSwiper from '@scripts/components/accessible-swiper'

(() => {
  if (typeof window.customElements.get('featured-product') !== 'undefined') { return }
  window.customElements.define('featured-product', class FeaturedProduct extends HTMLElement { // eslint-disable-line
    constructor () {
      super()

      this.badge = this.querySelector('[data-featured-badge]')
      this.price = this.querySelector('[data-featured-price]')
      this.swatches = this.querySelectorAll('[data-swatch-option]')
      this.color_label = this.querySelector('[data-product-option-group-selected-text]')
      this.images = this.querySelectorAll('[data-featured-product-image]')

      this.initBadge()
      this.initSwatches()
    }

    initBadge () {
      document.addEventListener('scroll', () => {
        this.badge.style.transform = 'rotate(' + (window.scrollY * 0.1) + 'deg)'
      })
    }

    initSwatches () {
      this.swatches.forEach((swatch) => {
        swatch.addEventListener('click', () => {
          const associatedImage = [...this.images].find(image => image.dataset.featuredProductImage === swatch.dataset.swatchOption)
          const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })
          const associatedPrice = formatter.format((Number(associatedImage.dataset.featuredProductPrice)) / 100)

          // Update featured product image
          this.images.forEach((image) => {
            image.classList.add('hide')
          })
          associatedImage.classList.remove('hide')

          // Update price
          this.price.textContent = associatedPrice

          // Update color label
          this.color_label.textContent = swatch.dataset.swatchOption
        })
      })
    }
  })

  if (typeof window.customElements.get('care-instructions') !== 'undefined') { return }
  window.customElements.define('care-instructions', class CareInstructions extends AccessibleSwiper { // eslint-disable-line
    constructor () {
      super()

      this.slider = this.querySelector('[data-swiper-slider]')
      this.enabled = this.slider.dataset.swiperEnabled
      this.next = this.querySelector('[data-swiper-next]')
      this.prev = this.querySelector('[data-swiper-prev]')

      if (this.enabled === 'true') {
        this.options = {
          ...this.options,
          spaceBetween: 14,
          slidesPerView: 'auto',
          threshold: 10,
          breakpoints: {
            1025: {
              spaceBetween: 12
            }
          },
          navigation: {
            nextEl: this.next,
            prevEl: this.prev
          }
        }

        this.accessibleSwiper()
      }
    }
  })
})()

// const SECTION_NAME = 'featured-product'

// const initFeaturedProduct = () => {
//   const badge = document.querySelector('[data-featured-badge]')

//   document.addEventListener('scroll', () => {
//     badge.style.transform = 'rotate(' + (window.scrollY * 0.1) + 'deg)'
//   })
// }

// const run = () => {
//   initFeaturedProduct()
// }

// // Ensure section JS only runs once
// if (!isScriptLoaded(SECTION_NAME)) {
//   document.addEventListener('DOMContentLoaded', run)
//   document.addEventListener('shopify:section:load', run)

//   markScriptLoaded(SECTION_NAME)
// }
