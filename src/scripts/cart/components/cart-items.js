import cartAPI from '@scripts/cart/cart-api'
import {
  cartItemTemplate,
  cartItemTemplateEmpty,
  cartItemPrice,
  bundleChildrenPrice,
  bundleChildrenDetails
} from '@scripts/cart/templates/cart-items-templates'

(() => {
  if (
    typeof window.customElements.get('cart-items') !== 'undefined' ||
    typeof window.customElements.get('cart-item') !== 'undefined'
  ) { return }

  window.customElements.define('cart-items', class CollectionItemList extends HTMLElement { // eslint-disable-line
    constructor () {
      super()
      this.parser = new DOMParser() // eslint-disable-line
      window.addEventListener('cartAPI', ({ detail: { cartData } }) => {
        this.buildList(cartData)
      })
    }

    buildList (cartData) {
      if (!cartData.items || cartData.items.length === 0) { return }
      const newItems = cartData.items
        .filter(item => this.querySelector(`[data-cart-item][data-key="${item.key}"]`) === null)

      const softBundlesAdded = []

      newItems.forEach((item) => {
        const childBundleProducts = checkBundleChildren(item, cartData)
        const isBundleChildProduct = typeof item.properties?._child_bundle_product !== 'undefined'
        const isSoftBundleProduct = typeof item.properties?._child_soft_bundle !== 'undefined'
        if (isBundleChildProduct) { return }

        const elmLit = (isSoftBundleProduct && softBundlesAdded.includes(item.properties?._child_soft_bundle))
          ? cartItemTemplateEmpty(item, childBundleProducts)
          : cartItemTemplate(item, childBundleProducts, isSoftBundleProduct)

        const doc = this.parser.parseFromString(elmLit, 'text/html')
        const elm = doc.querySelector('cart-item')
        if (!elm) { return }
        this.prepend(elm)

        if (isSoftBundleProduct) { softBundlesAdded.push(item.properties?._child_soft_bundle) }
      })
    }
  })

  window.customElements.define('cart-item', class CollectionItem extends HTMLElement { // eslint-disable-line
    constructor () {
      super()
      this.key = this.getAttribute('data-key')
      this.id = parseInt(this.getAttribute('data-id'), 10)
      this.itemData = {}
      this.bundleChildren = []
      this.isSoftBundle = this.hasAttribute('data-cart-item-soft-bundle')

      this.setItemData(cartAPI.getCartData())
      this.initQuantitySelector()
      this.initSellingPlanSelect()
      this.initRemoveButton()

      window.addEventListener('cartAPI', ({ detail: { cartData } }) => {
        this.setItemData(cartData)
      })
    }

    setItemData (cartData) {
      this.itemData = cartData.items.find(item => item.key === this.key)

      if (typeof this.itemData === 'undefined' || !this.itemData) {
        this.remove()
      } else {
        this.bundleChildren = checkBundleChildren(this.itemData, cartData)
        this.updateCartItem()
      }
    }

    initQuantitySelector () {
      const quantitySelector = this.querySelector('[data-quantity-input]')
      if (!quantitySelector) { return }

      let changeTimeout = null
      quantitySelector.addEventListener('change', () => {
        if (changeTimeout !== null) { clearTimeout(changeTimeout) }
        changeTimeout = setTimeout(() => {
          this.quantityChange(quantitySelector.value)
        }, 250)
      })
    }

    initSellingPlanSelect () {
      const sellingPlanSelect = this.querySelector('[data-selling-plan-select]')
      if (!sellingPlanSelect) { return }

      sellingPlanSelect.addEventListener('change', async () => {
        if (!this.bundleChildren || this.bundleChildren.length === 0) {
          await cartAPI.cartChange({
            id: this.key,
            selling_plan: sellingPlanSelect.value
          })
        } else {
          this.swapBundleSellingPlans(sellingPlanSelect)
        }
      })
    }

    swapBundleSellingPlans (sellingPlanSelect) {
      const itemsToSwap = this.isSoftBundle
        ? []
        : [{
            oldItemKey: this.key,
            newItem: {
              id: this.itemData.id,
              quantity: this.itemData.quantity,
              selling_plan: sellingPlanSelect.value || null,
              properties: this.itemData.properties
            }
          }]

      const sellingPlanName = sellingPlanSelect
        .options[sellingPlanSelect.selectedIndex].text

      this.bundleChildren.forEach((childItem) => {
        try {
          const chosenPlan = JSON.parse(
            childItem.properties?._selling_plan_options.replace(/`/g, '"')
          ).find(option => option.sellingPlan.name === sellingPlanName)

          const chosenPlanID = typeof chosenPlan === 'undefined'
            ? null
            : chosenPlan.sellingPlan.id.split('SellingPlan/')[1]

          itemsToSwap.push({
            oldItemKey: childItem.key,
            newItem: {
              id: childItem.id,
              quantity: childItem.quantity,
              selling_plan: chosenPlanID,
              properties: childItem.properties
            }
          })
        } catch (err) {
          console.error(err)
          return null
        }
      })

      cartAPI.cartSwap(itemsToSwap)
    }

    initRemoveButton () {
      const removeButton = this.querySelector('[data-remove-cart-item]')
      if (!removeButton) { return }

      removeButton.addEventListener('click', () => {
        this.quantityChange(0)
        this.classList.add('removed')
        setTimeout(() => { this.remove() }, 350)
      })
    }

    async quantityChange (newQuantity) {
      newQuantity = parseInt(newQuantity, 10)

      if (!this.bundleChildren || this.bundleChildren.length === 0) {
        await cartAPI.cartChange({
          id: this.key,
          quantity: newQuantity
        })

        return
      }

      const itemsToUpdate = { updates: {} }
      itemsToUpdate.updates[this.key] = newQuantity

      this.bundleChildren.forEach((childItem) => {
        itemsToUpdate.updates[childItem.key] = newQuantity
      })

      cartAPI.cartUpdate(itemsToUpdate)
    }

    updateCartItem () {
      const priceDisplay = this.querySelector('[data-price]')
      if (priceDisplay !== null) {
        priceDisplay.innerHTML = this.isSoftBundle
          ? bundleChildrenPrice(this.itemData, this.bundleChildren)
          : cartItemPrice(this.itemData.final_line_price, this.itemData.original_line_price)
      }

      const quantitySelector = this.querySelector('[data-quantity-input]')
      if (quantitySelector !== null) { quantitySelector.value = this.itemData.quantity }

      const bundleChildrenHolder = this.querySelector('[data-bundle-childen]')
      if (bundleChildrenHolder !== null) {
        const isOpen = bundleChildrenHolder.querySelector('[data-bundle-details]').hasAttribute('open')
        bundleChildrenHolder.innerHTML = bundleChildrenDetails(this.itemData, this.bundleChildren)
        if (isOpen) { bundleChildrenHolder.querySelector('[data-bundle-details]').setAttribute('open', true) }
      }
    }
  })
})()

const checkBundleChildren = (item, cartData) => {
  return cartData.items.filter((childItem) => {
    return (
      typeof item.properties !== 'undefined' &&
      typeof childItem.properties !== 'undefined' &&
      item.properties !== null &&
      childItem.properties !== null &&
      (
        (
          typeof item?.properties?._parent_bundle_product !== 'undefined' &&
          typeof childItem.properties._child_bundle_product !== 'undefined' &&
          item.properties._parent_bundle_product === childItem.properties._child_bundle_product
        ) ||
        (
          typeof item.properties._child_soft_bundle !== 'undefined' &&
          typeof childItem.properties._child_soft_bundle !== 'undefined' &&
          item.properties._child_soft_bundle === childItem.properties._child_soft_bundle
        )
      )
    )
  })
}
