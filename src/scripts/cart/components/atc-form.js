import cartAPI from '@scripts/cart/cart-api'
import queryVariantsById from '@scripts/storefront/queries/queryVariantsById'
import storefront from '@scripts/storefront/storefront'

(() => {
  if (typeof window.customElements.get('atc-form') !== 'undefined') { return }

  window.customElements.define('atc-form', class AddToCartForm extends HTMLElement { // eslint-disable-line
    constructor () {
      super()
      this.form = this.querySelector('form')
      this.storefrontInfo = null
      if (!this.form) { return }
      this.initFrom()
    }

    initFrom () {
      this.form.addEventListener('submit', (event) => {
        event.preventDefault()
        this.addToItemCart()
      })
    }

    async addToItemCart () {
      const formData = new FormData(this.form) // eslint-disable-line
      const atcData = Object.fromEntries(formData)

      const isBundleATC =
        typeof atcData.bundle_products !== 'undefined' &&
        atcData.bundle_products !== null &&
        atcData.bundle_products.length !== 0

      const isSoftBundleATC =
        typeof atcData.soft_bundle_products !== 'undefined' &&
        atcData.soft_bundle_products !== null &&
        atcData.soft_bundle_products.length !== 0

      if ((typeof atcData.id === 'undefined' || !atcData.id) && !isSoftBundleATC) { return }

      this.storefrontInfo = await this.getStorefrontInfo(atcData)

      const maxQuantity = this.storefrontInfo
        ?.map(info => info.quantity_availiable)
        .filter(qty => qty !== null)
        .sort((a, b) => { return b.quantity_availiable - a.quantity_availiable })[0]

      const propertiesObject = Object.keys(atcData)
        .filter(key => key.includes('properties'))
        .reduce((prev, cur, index) => {
          const name = cur.replace(/properties|\[|\]/g, '')
          if (name.length === 0 || !atcData[cur] || atcData[cur].length === 0) { return prev }
          prev[name] = atcData[cur]
          return prev
        }, {
          _inventory_quantity: maxQuantity || null
        })

      if (atcData.id) { propertiesObject._selling_plan_options = this.getSellingPlan(atcData.id, atcData.selling_plan) }

      const itemsToAdd = isSoftBundleATC
        ? { items: [] }
        : {
            items: [{
              id: atcData.id,
              quantity: typeof atcData.quantity === 'undefined' ? 1 : atcData.quantity,
              selling_plan: typeof atcData.selling_plan === 'undefined' ? null : atcData.selling_plan,
              properties: propertiesObject
            }]
          }

      if (isBundleATC || isSoftBundleATC) {
        const bundleID = `bundle_${new Date().getTime()}`
        const bundleItems = this.checkBundleItems(atcData, bundleID, propertiesObject, isSoftBundleATC)
        bundleItems.forEach(item => itemsToAdd.items.push(item))

        if (bundleItems.length !== 0 && isBundleATC) {
          itemsToAdd.items[0].properties._parent_bundle_product = bundleID
          itemsToAdd.items[0].properties._parent_bundle_children = atcData.bundle_products
        }
      }

      if (itemsToAdd.items.length === 0) { return }
      cartAPI.cartAdd(itemsToAdd)
    }

    checkBundleItems (atcData, bundleID, propertiesObject, isSoftBundleATC) {
      const bundleList = (isSoftBundleATC ? atcData.soft_bundle_products : atcData.bundle_products)
        .replace(/ /g, '').split(',')

      if (bundleList.length === 0) { return [] }

      const bundleItems = bundleList.map((productID, index) => {
        const childProperties = Object.assign({}, propertiesObject)
        childProperties._child_unique_id = `bundle_child_${new Date().getTime()}--${index}`
        childProperties._selling_plan_options = this.getSellingPlan(productID, atcData.selling_plan)

        if (isSoftBundleATC) {
          childProperties._child_soft_bundle = bundleID
        } else {
          childProperties._child_bundle_product = bundleID
        }

        return {
          id: productID,
          quantity: typeof atcData.quantity === 'undefined' ? 1 : atcData.quantity,
          selling_plan: typeof atcData.selling_plan === 'undefined'
            ? null
            : this.getSellingPlan(productID, atcData.selling_plan, true),
          properties: childProperties
        }
      })

      return bundleItems
    }

    getSellingPlan (id, sellingPlanID, returnPlanID = false) {
      if (!id || !this.storefrontInfo) { return null }

      const variantSellingPlans = this.storefrontInfo.find(option => option.variant_id === id)
      if (typeof variantSellingPlans === 'undefined') { return null }

      if (!returnPlanID) {
        return JSON.stringify(variantSellingPlans.selling_plan_options).replace(/"/g, '`')
      }

      if (typeof sellingPlanID === 'undefined' || !sellingPlanID) { return null }

      const activePlan = this.storefrontInfo
        .flatMap(options => options.selling_plan_options)
        .find(option => parseInt(option.sellingPlan.id.split('SellingPlan/')[1], 10) === parseInt(sellingPlanID, 10))
      if (typeof activePlan === 'undefined') { return null }

      const selectedPlan = variantSellingPlans.selling_plan_options
        .find(option => option.sellingPlan.name === activePlan.sellingPlan.name)
      if (typeof selectedPlan === 'undefined') { return null }

      return selectedPlan.sellingPlan.id.split('SellingPlan/')[1]
    }

    async getStorefrontInfo (atcData) {
      const variantArray = [atcData.id, atcData.bundle_products, atcData.soft_bundle_products]
        .filter(bundleDatatype => typeof bundleDatatype !== 'undefined' && bundleDatatype !== null)
        .flatMap(bundleDatatype => bundleDatatype.replace(/ /g, '').split(','))

      const queryResponse = await storefront.fetch(queryVariantsById([...new Set(variantArray)]))

      return queryResponse === null
        ? null
        : queryResponse.nodes.map(node => {
          return {
            variant_id: node.id.split('ProductVariant/')[1],
            quantity_availiable: node.quantityAvailable || null,
            selling_plan_options: node.sellingPlanAllocations.edges.map(edge => edge.node) || null
          }
        })
    }
  })
})()
