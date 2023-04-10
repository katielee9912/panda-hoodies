import './featured-product.scss'
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
      this.imagesArray = [...this.images]

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
        swatch.addEventListener('click', (event) => {
          const associatedImage = [...this.images].find(image => image.dataset.featuredProductImage === swatch.dataset.swatchOption)

          this.onSwatchChange(associatedImage) // Update featured product images

          const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })
          const associatedPrice = formatter.format((Number(associatedImage.dataset.featuredProductPrice)) / 100)

          this.price.textContent = associatedPrice // Update price
          this.color_label.textContent = swatch.dataset.swatchOption // Update color label
        })
      })
    }

    // Managing Featured Product Images on Swatch Select (Color Picker)
    async onSwatchChange (featuredImage) {
      const newImage = featuredImage
      newImage.setAttribute('loading', 'eager')
      const onImageLoaded = newImage.complete ? Promise.resolve() : new Promise((resolve) => newImage.onload === resolve)
      await onImageLoaded
      newImage.classList.remove('hide')
      const properties = [
        { clipPath: 'polygon(0 0, 0 0, 0 100%, 0% 100%)', transform: 'translateX(-20px)', zIndex: 1, opacity: 1, offset: 0 },
        { clipPath: 'polygon(0 0, 20% 0, 5% 100%, 0 100%)', transform: 'translateX(-20px)', zIndex: 1, opacity: 1, offset: 0.3 },
        { clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)', transform: 'translateX(0px)', zIndex: 1, opacity: 1, offset: 1 }
      ]
      await newImage.animate(properties, {
        duration: 500,
        easing: 'ease-in-out'
      }).finished
      this.imagesArray.filter((image) => image !== newImage).forEach((image) => image.classList.add('hide'))
    }
  })

  // Initializing Care Instructions slider section
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
