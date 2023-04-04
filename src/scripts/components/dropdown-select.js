(() => {
  if (typeof window.customElements.get('dropdown-select') !== 'undefined') { return }
  window.customElements.define('dropdown-select', class DropdownSelect extends HTMLElement { // eslint-disable-line
    constructor () {
      super()

      this.select = this.querySelector('select')
      this.toggle = null
      this.prevValue = this.querySelector('select').value || null
      this.listBox = null
      this.options = []
      this.isOpen = false
      this.searchString = ''
      this.stringTimeout = null
      this.lastSearchString = ''
      this.lastSearchIndex = null

      if (!this.select) { return }
      this.buildDropdown()
    }

    buildDropdown () {
      this.classList.add('dropdown-select')
      const stamp = new Date().getTime()

      this.innerHTML = `
        <div
          aria-haspopup="listbox"
          aria-label="${this.select.getAttribute('aria-label') || this.select.name}"
          aria-controls="listbox__${stamp}"
          ${this.getLabelledByAttribute(stamp)}"
          aria-expanded="false"
          role="button"
          tabindex="0"
        ></div>
        <ul
          role="listbox"
          ${this.getLabelledByAttribute(stamp)}"
          aria-activedescendant="${this.select.value}"
          tabindex="-1"
          aria-hidden="true"
        >
          ${
            Array.from(this.querySelectorAll('option'))
              .map((opt, index) => `
                <li
                  data-value="${opt.value}"
                  data-index="${index}"
                  ${opt.disabled ? 'data-disabled' : ''}
                  aria-selected="${opt.value === this.select.value}"
                  role="option"
                >
                  ${opt.text}
                </li>
              `).join('')
          }
        </ul>
      `

      this.options = [...this.querySelectorAll('[data-value]')]
      this.options.forEach(opt => this.optionEvents(opt))
      this.toggle = this.querySelector('[role="button"]')
      this.listBox = this.querySelector('[role="listbox"]')
      this.toggle.append(this.select)
      this.select.setAttribute('tabindex', -1)

      this.mainEvents()
    }

    mainEvents () {
      this.select.addEventListener('change', (event) => {
        this.setChosen()
      })

      this.toggle.addEventListener('mousedown', (event) => {
        if (this.hasAttribute('open')) {
          this.closeDropdown(event, false)
        } else {
          this.openDropdown(event)
        }
      })

      window.addEventListener('click', (event) => {
        if (this.contains(event.target) || !this.hasAttribute('open')) { return }
        this.closeDropdown(event, true)
      })

      window.addEventListener('keydown', (event) => {
        switch (event.key) {
          case 'Escape':
            this.closeDropdown(event, true)
            break
          case 'ArrowUp':
            if (this.hasAttribute('open')) {
              this.shiftOption(event, -1)
            } else if (this.contains(event.target)) {
              this.openDropdown(event)
              this.focusOption(event, 'first')
            }
            break
          case 'ArrowDown':
            if (this.hasAttribute('open')) {
              this.shiftOption(event, 1)
            } else if (this.contains(event.target)) {
              this.openDropdown(event)
              this.focusOption(event, 'last')
            }
            break
          case 'Home' :
            if (this.hasAttribute('open') && this.contains(event.target)) {
              this.focusOption(event, 'first')
            }
            break
          case 'End' :
            if (this.hasAttribute('open') && this.contains(event.target)) {
              this.focusOption(event, 'last')
            }
            break
          case 'Enter' :
          case ' ' :
            if (this.hasAttribute('open')) {
              this.closeDropdown(event, false)
            } else if (this.contains(document.activeElement)) {
              this.openDropdown(event)
            }
            break
          case 'Tab':
            if (
              this.contains(document.activeElement) &&
                this.hasAttribute('open')
            ) {
              this.closeDropdown(event, true)
            }
            break
          default:
            this.stringSearch(event.key)
            break
        }
      })
    }

    optionEvents (option) {
      option.addEventListener('click', (event) => {
        this.optionValueChange(option)
        this.removeAttribute('open')
        this.prevValue = this.select.value
        this.select.dispatchEvent(new Event('change', { bubbles: true }))
      })
    }

    openDropdown (event) {
      event.preventDefault()
      this.prevValue = this.select.value
      this.isOpen = true
      this.toggle.setAttribute('aria-expanded', true)
      this.listBox.setAttribute('aria-hidden', false)
      this.setAttribute('open', '')
      setTimeout(() => this.listBox.focus(), 0)
      this.setChosen()
    }

    closeDropdown (event, prevSet = false) {
      if (event.key !== 'Tab') {
        event.preventDefault()
        this.toggle.focus()
      }

      this.toggle.setAttribute('aria-expanded', false)
      this.listBox.setAttribute('aria-hidden', true)
      this.removeAttribute('open')
      this.isOpen = false
      this.setChosen()

      if (prevSet) {
        this.select.value = this.prevValue
      } else {
        this.prevValue = this.select.value
        this.select.dispatchEvent(new Event('change', { bubbles: true }))
      }
    }

    shiftOption (event, move) {
      event.preventDefault()
      const validOptions = [...this.select.options]
        .filter((opt, index) => (
          !opt.disabled &&
            (
              (move === -1 && index < this.select.selectedIndex) ||
              (move === 1 && index > this.select.selectedIndex)
            )
        ))

      if (validOptions.length === 0) { return }
      const newIndex = move === 1
        ? validOptions[0]
        : validOptions[validOptions.length - 1]

      this.select.value = this.select.options[[...this.select.options].indexOf(newIndex)].value
      this.setChosen()
    }

    focusOption (event, firstOrLast) {
      event.preventDefault()
      this.setAttribute('open', '')
      const validOptions = [...this.select.options]
        .filter((opt) => !opt.disabled)

      if (validOptions.length === 0) { return }
      const newIndex = firstOrLast === 'first'
        ? validOptions[0]
        : validOptions[validOptions.length - 1]

      this.select.value = this.select.options[[...this.select.options].indexOf(newIndex)].value
      this.setChosen()
    }

    optionValueChange (option) {
      this.select.value = option.getAttribute('data-value')
      this.setChosen()
    }

    setChosen () {
      if (this.isOpen === false) { return }

      this.options.forEach(opt => {
        opt.setAttribute(
          'aria-selected',
          opt.getAttribute('data-value') === this.select.value
        )
      })

      const selOpt = this.options
        .find(opt => opt.getAttribute('aria-selected') === 'true')

      if (typeof selOpt === 'undefined') { return }
      selOpt.scrollIntoView({ block: 'nearest', inline: 'nearest' })
      this.toggle.setAttribute('aria-label', this.select.options[this.select.selectedIndex].innerText)
      this.listBox.setAttribute('aria-activedescendant', this.select.value)
    }

    stringSearch (key) {
      if (!key?.match(/[a-z]|[0-9]/) || !this.hasAttribute('open')) { return }

      this.searchString += key
      if (this.stringTimeout) { clearTimeout(this.stringTimeout) }

      this.stringTimeout = setTimeout(() => {
        this.searchForStringOption(this.searchString)
        this.searchString = ''
        this.stringTimeout = null
      }, 500)
    }

    searchForStringOption (string) {
      const foundOptions = this.options
        .filter((opt, index) => (
          opt.innerText.toLowerCase().indexOf(string) === 0 &&
          !opt.hasAttribute('data-disabled')
        ))

      if (foundOptions.length === 0) { return }
      const foundIndex =
        this.lastSearchIndex === null ||
        this.lastSearchString !== string ||
        this.lastSearchIndex + 1 >= foundOptions.length
          ? 0
          : this.lastSearchIndex + 1

      const foundOption = foundOptions[foundIndex]
      this.lastSearchIndex = foundIndex
      this.lastSearchString = string
      this.select.value = this.select.options[this.options.indexOf(foundOption)].value
      this.setChosen()
    }

    getLabelledByAttribute (stamp) {
      const label = document.querySelector(`[for="${this.select.id}"`)
      if (!label) { return '' }
      label.setAttribute('tabindex', -1)
      label.classList.add('no-click')
      label.id = `dropdown-select__${stamp}`
      return `aria-labelledby="${label.id}"`
    }
  })
})()
