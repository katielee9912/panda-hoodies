import './hero-slider.scss'

import AccessibleSwiper from '@scripts/components/accessible-swiper'

(() => {
  if (typeof window.customElements.get('hero-slider') !== 'undefined') { return }
  window.customElements.define('hero-slider', class HeroSlider extends AccessibleSwiper { // eslint-disable-line
    constructor () {
      super()

      this.slider = this
      this.next = this.querySelector('[data-swiper-next]')
      this.prev = this.querySelector('[data-swiper-prev]')
      this.pagination = this.querySelector('[data-swiper-pagination]')

      this.options = {
        ...this.options,
        spaceBetween: 24,
        slidesPerView: 'auto',
        threshold: 10,
        loop: true,
        pagination: {
          el: this.pagination,
          clickable: true
        },
        navigation: {
          nextEl: this.next,
          prevEl: this.prev
        }
      }

      this.accessibleSwiper()
    }
  })
})()
