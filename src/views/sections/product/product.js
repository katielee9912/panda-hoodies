// Import CSS
import './product.scss'

// Snippets
import '@snippets/product-gallery/product-gallery'
import '@snippets/back-in-stock-form/back-in-stock-form'

(() => {
  if (typeof window.customElements.get('product-wrap') !== 'undefined') { return }

  class ProductWrap extends HTMLElement {
    constructor () {
      super()

      this.productSelect = this.querySelector('[data-product-select]')
      this.productPriceEls = this.querySelectorAll('[data-product-price]')
      this.productComparePriceWrapEls = this.querySelectorAll('[data-product-compare-price-wrap]')
      this.productComparePriceEls = this.querySelectorAll('[data-product-compare-price]')
      this.productSubscribeComparePriceEls = this.querySelectorAll('[data-product-non-subscription-price]')
      this.productSubscribePriceEl = this.querySelector('[data-product-subscribe-price]')
      this.sectionId = this.getAttribute('data-section-id')
      this.submitButton = this.querySelector('[data-product-submit]')
      this.submitButtonTextEls = this.querySelectorAll('[data-product-submit-text]')
      this.selectedVariantData = null
      this.selectedVariantSellingPlan = null
      this.isSellingPlanSelected = false
      this.productData = null

      this.initProductSection()
    }

    async initProductSection () {
      try {
        this.productData = await fetch(`/products/${this.dataset.productHandle}.js`)
          .then(res => res.json())

        this.associatedProductsInit()
        this.productFormInit()
        this.productOptionsInit()
        this.productGalleriesInit()
      } catch (error) {
        console.error(error)
      }
    }

    productFormInit () {
      const currentUrl = new URL(document.location)

      this.productSelect.addEventListener('change', () => {
        this.getCurrentVariantData()
        this.updateProductPrices()
        this.updateButtonState()

        currentUrl.searchParams.set('variant', this.selectedVariantData.id)
        window.history.replaceState(null, null, currentUrl.toString())
      })

      this.getCurrentVariantData()
      this.subscriptionOptionsInit()
    }

    updateButtonState () {
      if (!this.submitButton || !this.selectedVariantData) { return }
      const buttonState = this.selectedVariantData.available ? 'add' : 'sold-out'

      this.submitButton.disabled = !this.selectedVariantData.available
      this.submitButtonTextEls.forEach(textEl => textEl.classList.toggle('d-none', buttonState !== textEl.dataset.state))
    }

    async associatedProductsInit () {
      const associatedProductToggles = this.querySelectorAll('[data-associated-product-toggle]')
      let associatedProductEls = document.querySelectorAll(`[data-section-id="${this.sectionId}"]`)

      if (!associatedProductToggles.length) { return }

      if (!this.hasAttribute('data-associated-product-section')) {
        const sectionPromises = [...associatedProductToggles]
          .filter(toggle => toggle.dataset.handle !== this.dataset.productHandle)
          .map(toggle => fetch(`${toggle.dataset.url}?sections=${this.sectionId}`))

        const sectionPromisesResults = await Promise.allSettled(sectionPromises)
        for (const result of sectionPromisesResults) {
          if (result.status === 'fulfilled') {
            const response = await result.value.json()
            const parser = new window.DOMParser()
            const responseDoc = parser.parseFromString(response[this.sectionId], 'text/html')
            const responseSection = responseDoc.querySelector('product-wrap')
            responseSection.setAttribute('data-associated-product-section', '')
            responseSection.classList.add('hide')
            this.insertAdjacentElement('afterend', responseSection)
          } else {
            console.error(result.value)
          }
        }

        associatedProductEls = document.querySelectorAll(`[data-section-id="${this.sectionId}"]`)
      }

      associatedProductToggles.forEach(toggle => {
        toggle.addEventListener('change', async () => {
          const matchingSection = [...associatedProductEls].find(productEl => productEl.dataset.productHandle === toggle.dataset.handle)
          if (!matchingSection) { return }

          associatedProductEls.forEach(productEl => {
            productEl.classList.toggle('hide', productEl.dataset.productHandle !== toggle.dataset.handle)
          })

          const matchingSectionButton = matchingSection.querySelector(`[data-associated-product-toggle][data-handle="${toggle.dataset.handle}"]`)
          if (matchingSectionButton) {
            matchingSectionButton.checked = true
            matchingSectionButton.focus()
          }

          const historyUrl = `${toggle.dataset.url}${matchingSection?.selectedVariantData
            ? `?variant=${matchingSection.selectedVariantData.id}`
            : ''
          }`
          window.history.replaceState({}, toggle.dataset.title, historyUrl)

          window.scrollTo(0, 0)
        })
      })
    }

    getCurrentVariantData () {
      const variantId = this.productSelect.value
      this.selectedVariantData = this.productData.variants.find(variant => variant.id === Number(variantId))
    }

    productOptionsInit () {
      const optionsParentEl = this.querySelector('[data-product-options]')
      const optionGroups = this.querySelectorAll('[data-product-option-group]')
      const optionRadios = this.querySelectorAll('[data-product-option][data-type="radio"]')
      const variantStockMessage = this.querySelector('[data-variant-stock-message]')
      const quantitySelectInput = this.querySelector('[data-quantity-input]')
      const bisEl = this.querySelector('bis-form')

      if (!optionsParentEl || !optionGroups.length) { return }

      const unavailableDisplay = optionsParentEl.getAttribute('data-unavailable-display')

      const getNextExistingVariant = (selectedOptions, optionIndex) => {
        const nextVariant = this.productData.variants.find(variant => variant[`option${optionIndex}`] === selectedOptions[`option${optionIndex}`])
        const nextVariantOptions = nextVariant.options.reduce((object, option, index) => {
          object[`option${index + 1}`] = option
          return object
        }, {})

        return {
          nextVariantOptions,
          nextVariant
        }
      }

      const getSelectedOptions = () => {
        const selectedOptions = [...optionGroups].reduce((object, group) => {
          let value = null
          if (group.dataset.type === 'select') {
            const select = group.querySelector('[data-product-option]')
            value = select.value
          } else {
            value = group.querySelector('[data-product-option]:checked').value
          }

          object[`option${group.dataset.optionIndex}`] = value
          return object
        }, {})

        return selectedOptions
      }

      const updateSelectedText = (group, input) => {
        optionGroups.forEach(optionGroup => {
          const selectedInput = optionGroup.querySelector('[data-product-option]:checked')
          const selectedTextEl = optionGroup.querySelector('[data-product-option-group-selected-text]')
          if (!selectedTextEl || !selectedInput) return

          const selectedText = selectedInput.dataset.selectedText

          selectedTextEl.textContent = selectedText
        })
      }

      const updateVariantStockMessage = (policy, quantity) => {
        const variantQuantity = parseInt(quantity, 10)

        if (!variantStockMessage) return
        variantStockMessage.classList.add('hide')

        if (policy === 'deny' && variantQuantity > 0 && variantQuantity < parseInt(variantStockMessage.dataset.lowStockBreakpoint, 10)) {
          variantStockMessage.classList.remove('hide')
        }
      }

      const updateQuanitySelect = (selectedVariant) => {
        if (!quantitySelectInput || !selectedVariant) { return }

        const selectedOption = this.productSelect.querySelector(`option[value="${selectedVariant.id}"]`)
        const { inventoryQuantity, inventoryPolicy } = selectedOption.dataset

        if (quantitySelectInput.value > inventoryQuantity && inventoryQuantity > 0) {
          quantitySelectInput.value = inventoryQuantity
        }

        const maxValue = inventoryPolicy === 'continue' ? 99 : inventoryQuantity

        quantitySelectInput.max = maxValue

        updateVariantStockMessage(inventoryPolicy, inventoryQuantity)
      }

      const updateOptionRadios = (selectedOptions) => {
        optionRadios.forEach((optionRadio, index) => {
          const inputOptions = { ...selectedOptions }
          const parentItemEl = optionRadio.closest('[data-product-option-item]')
          const optionIndex = Number(optionRadio.dataset.optionIndex)

          inputOptions[`option${optionIndex}`] = optionRadio.value

          const matchingVariant = getVariantByOptions(inputOptions)

          optionRadio.checked = optionRadio.value === selectedOptions[`option${optionIndex}`]

          parentItemEl.classList.toggle('unavailable', !matchingVariant)
          parentItemEl.classList.toggle('soldout', matchingVariant?.available === false)
        })
      }

      const getVariantByOptions = (options) => {
        const matchingVariant = this.productData.variants.find(variant => {
          let isMatch = true

          for (const [key, value] of Object.entries(options)) {
            if (variant[key] !== value) {
              isMatch = false
              break
            }
          }

          return isMatch
        })

        return matchingVariant || null
      }

      const setAtcButtonUnavailable = () => {
        if (!this.submitButton) { return }
        const buttonState = 'unavailable'
        this.submitButton.disabled = true
        this.submitButtonTextEls.forEach(textEl => textEl.classList.toggle('d-none', buttonState !== textEl.dataset.state))
      }

      optionGroups.forEach(optionGroup => {
        optionGroup.addEventListener('change', (event) => {
          handleOptionChange(optionGroup)
        })
      })

      const handleOptionChange = (group) => {
        let selectedOptions = getSelectedOptions()
        let selectedVariant = getVariantByOptions(selectedOptions)

        if (!selectedVariant && unavailableDisplay === 'select-next-available') {
          const nextVariantData = getNextExistingVariant(selectedOptions, group.dataset.optionIndex)
          selectedOptions = nextVariantData.nextVariantOptions
          selectedVariant = nextVariantData.nextVariant
        }

        updateOptionRadios(selectedOptions)
        updateSelectedText()
        updateQuanitySelect(selectedVariant)

        if (bisEl) {
          bisEl.handleVariantUpdate(selectedVariant)
        }

        if (selectedVariant) {
          this.productSelect.value = selectedVariant.id
          this.productSelect.dispatchEvent(new Event('change'))
        } else {
          setAtcButtonUnavailable()
        }
      }
      handleOptionChange(optionGroups[0])
    }

    updateProductPrices () {
      let price = this.selectedVariantData.price
      let comparePrice = this.selectedVariantData.compare_at_price

      if (this.isSellingPlanSelected && this.selectedVariantSellingPlan) {
        price = this.selectedVariantSellingPlan.price
        comparePrice = this.selectedVariantSellingPlan.compare_at_price
      }

      // Base prices
      this.productPriceEls.forEach(productPriceEl => {
        productPriceEl.textContent = Shopify.formatMoney(price, theme.moneyFormat)
      })

      // Compare at prices
      this.productComparePriceWrapEls.forEach(priceWrapEl => {
        priceWrapEl.classList.toggle('d-none', !comparePrice || price > comparePrice)
      })

      this.productComparePriceEls.forEach(priceEl => {
        priceEl.textContent = Shopify.formatMoney(comparePrice, theme.moneyFormat)
      })
    }

    subscriptionOptionsInit () {
      const sellingPlansGroupWrap = this.querySelector('[data-product-selling-plan-group-wrap]')
      const sellingPlansGroupEls = this.querySelectorAll('[data-product-selling-plan-group]')
      if (!sellingPlansGroupEls.length) { return }

      const subscriptionToggleRadios = this.querySelectorAll('[data-product-subscription-toggle]')
      const sellingPlanHiddenInput = this.querySelector('[data-product-selling-plan-input]')

      let currentSellingPlanGroupEl = null
      let currentSellingPlanSelect = null

      sellingPlansGroupEls.forEach(sellingPlansGroupEl => {
        const sellingPlanSelect = sellingPlansGroupEl.querySelector('[data-product-selling-plans-select]')

        sellingPlanSelect.addEventListener('change', () => {
          sellingPlanHiddenInput.value = sellingPlanSelect.value
          this.selectedVariantSellingPlan = this.selectedVariantData.selling_plan_allocations.find(allocation => allocation.selling_plan_id === Number(sellingPlanSelect.value))
          this.updateProductPrices()
        })
      })

      const updateCurrentSellingPlan = () => {
        const variantSellingPlanGroupIds = this.selectedVariantData.selling_plan_allocations.map(allocation => allocation.selling_plan_group_id)
        currentSellingPlanGroupEl = [...sellingPlansGroupEls].find(groupEl => variantSellingPlanGroupIds.includes(groupEl.dataset.id))
        currentSellingPlanSelect = currentSellingPlanGroupEl.querySelector('[data-product-selling-plans-select]')

        this.selectedVariantSellingPlan = this.selectedVariantData.selling_plan_allocations.find(allocation => allocation.selling_plan_id === Number(currentSellingPlanSelect.value))

        sellingPlanHiddenInput.value = currentSellingPlanSelect.value
      }

      const updateSellingPlanGroups = () => {
        sellingPlansGroupEls.forEach(groupEl => groupEl.classList.toggle('d-none', groupEl.dataset.id !== this.selectedVariantSellingPlan.selling_plan_group_id))
      }

      const updateSellingPlanPrices = () => {
        if (!this.selectedVariantSellingPlan) { return }

        this.productSubscribeComparePriceEls.forEach(priceEl => {
          priceEl.textContent = Shopify.formatMoney(this.selectedVariantData.price)
        })

        this.productSubscribePriceEl.textContent = Shopify.formatMoney(this.selectedVariantSellingPlan.price)
      }

      subscriptionToggleRadios.forEach(toggleRadio => {
        toggleRadio.addEventListener('change', () => {
          this.isSellingPlanSelected = toggleRadio.value === 'subscription'

          sellingPlansGroupWrap.classList.toggle('d-none', !this.isSellingPlanSelected)

          updateCurrentSellingPlan()
          updateSellingPlanGroups()

          this.updateProductPrices()
        })
      })

      this.productSelect.addEventListener('change', (event) => {
        updateCurrentSellingPlan()
        updateSellingPlanGroups()
        updateSellingPlanPrices()
        this.updateProductPrices()
      })
    }

    productGalleriesInit () {
      const galleryCarousels = this.querySelectorAll('product-gallery-carousel')
      const gridGallery = this.querySelector('product-gallery-grid')
      const simpleGallery = this.querySelector('product-gallery-simple')

      galleryCarousels.forEach(carousel => {
        carousel.selectedVariant = this.selectedVariantData
      })

      this.productSelect.addEventListener('change', () => {
        galleryCarousels.forEach(carousel => {
          carousel.selectedVariant = this.selectedVariantData
        })

        if (gridGallery) {
          gridGallery.selectedVariant = this.selectedVariantData
        }

        if (simpleGallery) {
          simpleGallery.selectedVariant = this.selectedVariantData
        }
      })
    }
  }

  window.customElements.define('product-wrap', ProductWrap)
})()
