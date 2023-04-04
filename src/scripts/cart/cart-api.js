/*
  Listen for Cart Updates with the 'cartAPI' Event Listener
  ====================================================================
  window.addEventListener('cartAPI', ({ detail: { cartData } }) => {
    console.log(cartData)
  })
  ====================================================================
*/

const cartAPI = new class CartAPI {
  constructor () {
    this.cartData = {}
    this.cart()
  }

  getCartData () {
    return this.cartData
  }

  async cart () {
    this.cartData = await this.cartFetch()
    window.dispatchEvent(new CustomEvent('cartAPI', { // eslint-disable-line
      detail: { cartData: this.cartData }
    }))
  }

  async cartAdd (data = null, pullCart = true) {
    if (!data) { return }
    const cartRes = await this.cartFetch('add', data)
    if (pullCart) { this.cart() }
    return cartRes
  }

  async cartChange (data = null, pullCart = true) {
    if (!data) { return }
    const cartRes = await this.cartFetch('change', data)
    if (pullCart) { this.cart() }
    return cartRes
  }

  async cartUpdate (data = null, pullCart = true) {
    if (!data) { return }
    const cartRes = await this.cartFetch('update', data)
    if (pullCart) { this.cart() }
    return cartRes
  }

  async cartClear (data = null, pullCart = true) {
    if (!data) { return }
    const cartRes = await this.cartFetch('clear', data)
    if (pullCart) { this.cart() }
    return cartRes
  }

  async cartSwap (data = null, pullCart = true) {
    if (!data) { return }

    const itemsToRemove = data.map(item => item.oldItemKey)
    const itemsToUpdate = {
      updates: itemsToRemove.reduce((prev, cur) => {
        prev[cur] = 0
        return prev
      }, {})
    }
    await this.cartUpdate(itemsToUpdate, false)

    const itemsToAdd = {
      items: data.map(item => item.newItem)
    }
    const cartRes = await this.cartAdd(itemsToAdd, false)

    if (pullCart) { this.cart() }
    return cartRes
  }

  async cartFetch (action = null, data = null) {
    const willPost = (
      data !== null &&
      (
        action === 'add' ||
        action === 'update' ||
        action === 'change' ||
        action === 'clear'
      )
    )

    const url = `/cart${willPost ? `/${action}` : ''}.js`
    const req = {
      method: willPost ? 'POST' : 'GET',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'xmlhttprequest'
      }
    }
    if (willPost && action !== 'clear') { req.body = JSON.stringify(data) }

    return await fetch(url, req)
      .then((response) => {
        return response.json()
      }).then((result) => {
        if (result.status) { throw new Error(result.description) }
        return result
      }).catch((error) => {
        console.error(error)
        return error
      })
  }
}()

export default cartAPI
