import newCustomElement from '@scripts/core/custom-html-element'
newCustomElement('bis-form', class extends HTMLElement {
  constructor () {
    super()
    this.parentProductEl = this.closest('product-wrap')

    if (!this.parentProductEl) { return }

    this.bisForm = this.querySelector('[data-bis-form]')
    this.bisVariantInput = this.querySelector('[data-bis-variant]')
    this.bisEmailInput = this.querySelector('[data-bis-email]')
    this.successEl = this.querySelector('[data-bis-success-response]')
    this.errorEl = this.querySelector('[data-bis-error-response]')
    this.app = this.getAttribute('data-app')

    if (this.parentProductEl) {
      this.selectedVariantData = this.parentProductEl.selectedVariantData
    }

    this.bisInit()
  }

  bisInit () {
    this.bisForm.addEventListener('submit', async (event) => {
      event.preventDefault()

      const variantId = Number(this.bisVariantInput.value)

      try {
        if (this.app === 'back_in_stock') {
          await this.handleBisAppSubmit(variantId)
        } else if (this.app === 'klaviyo') {
          await this.handleKlaviyoBisSubmit()
        } else {
          throw new Error('app not defined')
        }

        this.bisForm.classList.add('d-none')
        this.successEl.classList.remove('d-none')
        this.errorEl.classList.add('d-none')
      } catch (error) {
        this.bisForm.classList.add('d-none')
        this.successEl.classList.add('d-none')
        this.errorEl.classList.remove('d-none')
        console.error(error)
      }
    })
  }

  handleVariantUpdate (variantData) {
    if (variantData) {
      this.selectedVariantData = variantData
      this.bisVariantInput.value = Number(variantData.id)
    }

    this.classList.toggle('d-none', !variantData || variantData.available)
  }

  async handleBisAppSubmit (variantId) {
    return new Promise((resolve, reject) => {
      if (typeof window.BISPopover === 'undefined') {
        reject(Error('BISPopover not defined'))
      }

      BISPopover.create(bisEmailInput.value, variantId).then(data => { // eslint-disable-line
        if (data.status !== 'OK') {
          reject(Error(data.errors.base[0]))
        } else {
          resolve(data)
        }
      })
    })
  }

  async handleKlaviyoBisSubmit () {
    const data = new window.FormData(this.bisForm)

    try {
      return fetch('https://a.klaviyo.com/onsite/components/back-in-stock/subscribe', {
        method: 'POST',
        body: data
      }).then((response) => {
        return response
      })
    } catch (error) {
      return Promise.reject(error)
    }
  }
})
