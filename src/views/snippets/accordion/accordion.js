class accordion extends HTMLElement {
  constructor () {
    super()
    this.closing = false
    this.details = this.querySelector('details')
    this.summary = this.querySelector('summary')

    if (this.dataset.group) {
      this.uniqueId = Math.floor(Math.random() * 9999999)
    }
  }

  connectedCallback () {
    this.summary.addEventListener('click', (event) => {
      event.preventDefault()
      if (this.classList.contains('animating')) { return }

      if (this.details.open) {
        this.close()
      } else {
        this.open()
      }
    })

    this.addEventListener('transitionend', (event) => {
      this.style.height = null
      this.classList.remove('animating')

      if (this.closing) {
        this.details.open = false
        this.closing = false
      }
    })
  }

  open () {
    if (this.details.open === true) { return }

    this.style.height = `${this.summary.offsetHeight}px`
    this.details.open = true
    this.summary.setAttribute('aria-expanded', true)
    this.classList.add('animating')
    this.style.height = `${this.details.offsetHeight}px`
    this.closing = false

    this.closeGroupSiblings()
  }

  close () {
    if (this.details.open === false) { return }

    this.style.height = `${this.details.offsetHeight}px`
    this.classList.add('animating')
    this.style.height = `${this.summary.offsetHeight}px`
    this.closing = true
    this.summary.setAttribute('aria-expanded', false)
  }

  closeGroupSiblings () {
    if (!this.dataset.group || !this.uniqueId) { return }

    const groupAccordions = document.querySelectorAll(`custom-accordion[data-group="${this.dataset.group}"]`)
    groupAccordions.forEach(groupAccordion => {
      if (groupAccordion.uniqueId === this.uniqueId) { return }
      groupAccordion.close()
    })
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.customElements.define('custom-accordion', accordion)
})
