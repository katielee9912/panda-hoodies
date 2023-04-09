import './contact-us.scss'
(() => {
  if (typeof window.customElements.get('contact-us') !== 'undefined') { return }
  window.customElements.define('contact-us', class ContactUs extends HTMLElement { // eslint-disable-line
    constructor () {
      super()

      this.badge = this.querySelector('[data-lets-chat-badge]')
      this.initBadge()
    }

    initBadge () {
      document.addEventListener('scroll', () => {
        this.badge.style.transform = 'rotate(' + (window.scrollY * 0.1) + 'deg)'
      })
    }
  })
})()
