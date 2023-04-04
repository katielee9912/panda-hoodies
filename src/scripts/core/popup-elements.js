import trapFocus from '@scripts/core/trap-focus'
import newCustomElement from '@scripts/core/custom-html-element'

const openPopupsEls = []

/*
  Usage:
  <popup-element class="cart-drawer"
    data-id="cart-drawer"
    data-is-quickview
    role="dialog"
    inert
    aria-modal="true"
    aria-labelledby="id-of-title-element"
  >
    <h2 id="id-of-title-element">Cart items</h2>
  </popup-element>
*/

newCustomElement('popup-element', class extends HTMLElement {
  constructor () {
    super()

    this.isOpen = false
    this.id = this.getAttribute('data-id')
    this.siteOverlay = document.querySelector('[data-site-overlay]')
    this.initPopupElement()
    this.quickviewModalInit()
  }

  initPopupElement () {
    document.body.insertAdjacentElement('beforeend', this)
  }

  handleOpen () {
    this.siteOverlay.classList.add('active')
    this.classList.add('active')
    this.removeAttribute('inert')
    trapFocus.open(this)
    this.checkVideo()

    openPopupsEls.push(this)

    this.updateSiteOverlayZindex()
  }

  handleClose () {
    this.classList.remove('active')
    this.setAttribute('inert', '')

    trapFocus.close()

    const thisPopupIndex = openPopupsEls.findIndex(popup => popup === this)
    thisPopupIndex > -1 && openPopupsEls.splice(thisPopupIndex, 1)

    if (!openPopupsEls.length) {
      this.siteOverlay.classList.remove('active')
    } else {
      const previousOpenPopup = openPopupsEls[openPopupsEls.length - 1]
      previousOpenPopup.updateSiteOverlayZindex()
      trapFocus.open(previousOpenPopup)
    }
  }

  updateSiteOverlayZindex () {
    const popupStyle = window.getComputedStyle(this)
    const popupZindex = popupStyle.getPropertyValue('z-index')
    this.siteOverlay.style.zIndex = popupZindex - 1
  }

  checkVideo (play) {
    if (!this.hasAttribute('data-autoplay-video')) { return }
    const videos = this.querySelectorAll('video')
    if (play === true) {
      videos.forEach((video, index) => {
        video.currentTime = 0
        if (index !== 0) { return }
        video.play()
      })
    } else {
      videos.forEach((video) => {
        video.pause()
      })
    }
  }

  quickviewModalInit () {
    if (!this.hasAttribute('data-is-quickview-modal')) { return }

    window.addEventListener('cartAPI', ({ detail: { cartData } }) => {
      this.open = false
    })
  }

  set open (isOpen) {
    if (isOpen === true) {
      this.handleOpen()
    } else if (isOpen === false) {
      this.handleClose()
    }
  }

  get open () {
    return this.isOpen
  }
})

/*
  Usage:
  <popup-toggle data-target="cart-drawer" data-action="open">
    <button>Open Cart</button>
  </popup-toggle>
*/
newCustomElement('popup-toggle', class extends HTMLElement {
  constructor () {
    super()

    this.action = this.getAttribute('data-action')
    this.target = this.getAttribute('data-target')
    this.targetEl = null
    this.initToggle()
  }

  initToggle () {
    this.targetEl = document.querySelector(`popup-element[data-id="${this.target}"]`)
    if (!this.targetEl) { return }

    this.addEventListener('click', () => {
      this.targetEl.open = this.action === 'open'
    })
  }
})

const siteOverlay = document.querySelector('[data-site-overlay]')
siteOverlay.addEventListener('click', closeCurrentPopupEl)

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') { return }
  closeCurrentPopupEl()
})

function closeCurrentPopupEl () {
  const popupToClose = openPopupsEls[openPopupsEls.length - 1]
  if (!popupToClose) { return }

  popupToClose.open = false
}
