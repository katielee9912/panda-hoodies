const storefront = new class StoreFront {
  constructor () {
    this.STOREFRONT_API_TOKEN = window.theme?.storefront?.apiToken
    this.STORE = window.theme?.storefront?.store
    this.invalidCredentials = false

    if (
      typeof this.STORE !== 'undefined' &&
      typeof this.STOREFRONT_API_TOKEN !== 'undefined' &&
      this.STOREFRONT_API_TOKEN !== null
    ) { return }

    console.warn('STOREFRONT_API_TOKEN or STORE is not set.')
    this.invalidCredentials = true
  }

  async fetch (graphqlData) {
    if (this.invalidCredentials) { return null }

    const fetchHeaders = new Headers() // eslint-disable-line
    fetchHeaders.append('x-shopify-storefront-access-token', this.STOREFRONT_API_TOKEN)
    fetchHeaders.append('Content-Type', 'application/json')

    const requestOptions = {
      method: 'POST',
      headers: fetchHeaders,
      body: graphqlData,
      redirect: 'follow'
    }

    const response = await fetch(`https://${this.STORE}/api/2022-04/graphql.json`, requestOptions)
      .then(response => response.json())

    if (response.errors) {
      console.error(response.errors)
      return null
    }

    return response.data
  }
}()

export default storefront
