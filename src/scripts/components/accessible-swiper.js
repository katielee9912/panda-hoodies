import Swiper from 'swiper'
import { swiperSlidesInView } from '@scripts/components/swiper-slides-in-view'

export default class AccessibleSwiper extends HTMLElement { // eslint-disable-line
  constructor () {
    super()

    // Swiper parameters should be setup in the js that extends AccessibleSwiper.
    this.options = { a11y: { enabled: false } }
  }

  /**
   * Initializes the Swiper slider.
   * Required: this.slider, this.options (Swiper parameters)
   * Optional: this.pagination, this.next, this.prev
   *
   * @returns this.swiper
   */
  async initSwiper () {
    this.swiper = new Swiper(this.slider, this.options)
    return this.swiper
  }

  /**
   * This function handles slide notification, pagination,
   * and navigation to be ADA compliant.
   */
  accessibleSwiper () {
    if (!this.slider) { return }

    this.initSwiper().then(() => {
      this.initNotification()
      if (this.pagination) {
        this.initPagination()
      }
      swiperSlidesInView(this, { threshold: 0.95, desktopOnly: false })

      observeChildren(this, () => {
        if (this.pagination) {
          let activeIndex = 0

          // Update the active bullet aria-label to read as "Current Slide"
          this.paginationBullets.forEach(bullet => {
            if (bullet.classList.contains('swiper-pagination-bullet-active')) {
              activeIndex = bullet.getAttribute('data-bullet-index')
            }
            bullet.setAttribute('aria-label', `Go to slide ${bullet.getAttribute('data-bullet-index')}`)
          })
          this.paginationBullets[parseInt(activeIndex) - 1].setAttribute('aria-label', 'Current slide')
        }

        // Update the Swiper notification to read out the active slide's contet
        for (let i = 0; i < this.swiper.slides.length; i++) {
          if (this.swiper.slides[i].classList.contains('swiper-slide-active')) {
            this.notification.textContent = this.swiper.slides[i].innerText
          }
        }
      })
    })

    // Observer that checks if children have updated according to their attributes (including classes)
    const observeChildren = (function () {
      const MutationObserver = window.MutationObserver || window.WebKitMutationObserver
      return function (parent, callback) {
        if (!parent || parent.nodeType !== 1) { return }
        if (MutationObserver) {
          const observer = new MutationObserver(callback)
          observer.observe(parent, { attributes: true, subtree: true })
          return observer
        } else if (window.addEventListener) { // Browser support fallback
          parent.addEventListener('DOMNodeInserted', callback, false)
          parent.addEventListener('DOMNodeRemoved', callback, false)
        }
      }
    })()
  }

  /**
   * This function generates a notification span element.
   * This span will automatically get populated with the
   * active slide's content for screen readers to announce.
   */

  initNotification () {
    this.notification = document.createElement('span')
    this.notification.setAttribute('aria-live', 'assertive')
    this.notification.setAttribute('data-swiper-notification', '')
    this.notification.classList.add('visually-hidden')
    this.slider.appendChild(this.notification)
  }

  /**
   * This function assigns indices to all pagination bullets and
   * sets the active bullet's aria-label to "Current slide".
   */

  initPagination () {
    this.paginationBullets = Object.values(this.swiper.pagination.bullets)
    this.paginationBullets.pop()

    // Assign indicies for each bullet
    for (let i = 0; i < this.paginationBullets.length; i++) {
      this.paginationBullets[i].setAttribute('data-bullet-index', i + 1)
      this.paginationBullets[i].tabIndex = 0
      this.paginationBullets[i].setAttribute('aria-label', `Go to slide ${i + 1}`)
    }

    // Manage pagination aria-labels
    this.paginationBullets.forEach(bullet => {
      bullet.addEventListener('click', () => {
        this.paginationBullets.forEach(bullet => {
          bullet.setAttribute('aria-label', `Go to slide ${bullet.getAttribute('data-bullet-index')}`)
        })
        bullet.setAttribute('aria-label', 'Current slide')
      })
    })
    this.paginationBullets[0].setAttribute('aria-label', 'Current slide')
  }
}
