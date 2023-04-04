import './social.scss'

(() => {
  if (typeof window.customElements.get('social-swiper') !== 'undefined') { return }

  window.customElements.define('social-swiper', class SocialSwiper extends HTMLElement { // eslint-disable-line
    constructor () {
      super()
      this.init()
    }

    init () {
      const swiper = new Swiper(this, {
        loop: true,
        slidesPerView: 'auto',
        threshold: 10,
        noSwiping: false,
        freeMode: true,
        draggable: true,
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev'
        }
      })

      return swiper
    }
  })
})()
