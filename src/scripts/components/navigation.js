(() => {
  if (typeof window.customElements.get('site-nav') !== 'undefined') { return }

  window.customElements.define('site-nav', class SiteNav extends HTMLElement { // eslint-disable-line
    constructor () {
      super()

      this.navItems = this.querySelectorAll('[data-nav-item]')
      this.navLinks = [...this.navItems]
      this.init()
    }

    init () {
      this.navLinks.forEach(navLink => {
        // Keyboard control events
        navLink.addEventListener('keydown', (event) => {
          if (event.key === 'ArrowRight') {
            this.stepNext(this.navLinks)
          } else if (event.key === 'ArrowLeft') {
            this.stepPrev(this.navLinks)
          } else if (event.keyCode >= 65 && event.keyCode <= 90) {
            // jump to main nav items by char
            this.focusChar(event, this.primaryLinks)
          }
        })

        navLink.addEventListener('click', (event) => {
          event.preventDefault()
          this.adjustAnchors(navLink)
        })
      })
    }

    stepNext (linkList) {
      const focusedElement = document.activeElement
      const activeIndex = linkList.indexOf(focusedElement)
      if (activeIndex + 1 < linkList.length) {
        linkList[activeIndex + 1].focus()
      }
    }

    stepPrev (linkList) {
      const focusedElement = document.activeElement
      const activeIndex = linkList.indexOf(focusedElement)
      if (activeIndex - 1 >= 0) {
        linkList[activeIndex - 1].focus()
      }
    }

    focusChar (event, linkList) {
      // Find all elements where the first letter is the pressed key AND the active element
      const relevantArray = [...linkList].filter(child => child.textContent.trim().toLowerCase().charAt(0) === event.key || child === document.activeElement)
      // Get current active element index
      const activeIndex = [...relevantArray].findIndex(child => child === document.activeElement)

      // Offset the array by the current active element. Allows using the focus function to select the next/prev
      const offsetArray = this.offsetArray(relevantArray, activeIndex)

      // Get only the relevant key items (removes active element if it does not match)
      const characterArray = [...offsetArray].filter(child => child.textContent.trim().toLowerCase().charAt(0) === event.key)
      if (!characterArray.length) { return }

      this.stepNext(characterArray)
    }

    offsetArray (array, offset) {
      return [...[...array].slice(offset), ...[...array].slice(0, offset)]
    }

    adjustAnchors (navLink) {
      const navLinkRef = navLink.getAttribute('data-nav-link')

      if (navLinkRef === '#') {
        window.scrollTo(0, 0)
        return
      }
      const destinationElement = document.querySelector(navLinkRef)
      const parentElement = destinationElement.parentElement
      parentElement.scrollIntoView({ behavior: 'smooth' })
    }
  })
})()
