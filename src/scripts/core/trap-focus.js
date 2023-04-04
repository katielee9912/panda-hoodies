const trapFocus = {
  targetEl: null,
  isOpen: false,
  lastFocusedEl: null,
  focusableEls: [],

  open: function (target) {
    if (this.isOpen === true) {
      document.body.removeEventListener('focusin', checkIfFocusIsInTarget)
    }

    this.targetEl = target
    this.setFocusableEls()
    this.lastFocusedEl = document.activeElement
    this.isOpen = true

    window.addEventListener('focusin', checkIfFocusIsInTarget)

    setTimeout(() => {
      this.focusableEls[0].focus()
    }, 50)
  },

  close: function () {
    if (this.isOpen === false) { return }

    window.removeEventListener('focusin', checkIfFocusIsInTarget)

    this.isOpen = false

    setTimeout(() => {
      this.lastFocusedEl?.focus({ focusVisible: true })
    }, 500)
  },

  setFocusableEls: function () {
    this.focusableEls = [
      ...this.targetEl.querySelectorAll(
        'a, button, input, textarea, select, summary, [tabindex]:not([tabindex="-1"])'
      )
    ].filter(el => !el.hasAttribute('disabled') && el.offsetParent !== null)
  }
}

function checkIfFocusIsInTarget (event) {
  if (trapFocus.targetEl && trapFocus.targetEl.contains(event.target)) { return }

  trapFocus.setFocusableEls()

  if (event.relatedTarget === trapFocus.focusableEls[0]) {
    trapFocus.focusableEls[trapFocus.focusableEls.length - 1].focus()
  } else {
    trapFocus.focusableEls[0].focus()
  }
}

export default trapFocus
