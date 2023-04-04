import trapFocus from '@scripts/core/trap-focus'
import newCustomElement from '@scripts/core/custom-html-element'
import { collectionResultsTemplate, productResultsTemplate, resultsContainerTemplate } from '@scripts/quicksearch/templates/results-templates'

newCustomElement('quick-search', class extends HTMLElement {
  constructor () {
    super()

    this.searchForm = this.querySelector('form')
    this.searchInput = this.querySelector('input[name="q"]')
    if (!this.searchForm || !this.searchInput) { return }

    this.resultsContainer = this.initResults()
    this.showResults = false
    this.initSearchInput()
    this.accessabilityEvents()
  }

  get showResults () {
    return this._resultsAreVisiable
  }

  set showResults (isVisible) {
    this._resultsAreVisiable = isVisible
    this.resultsContainer.classList.toggle('hide', isVisible === false)

    if (isVisible && !this.isFocused) {
      this.isFocused = true
      trapFocus.open(this)
      this.searchInput.focus()
    } else if (!isVisible) {
      this.isFocused = false
      this.searchInput.focus()
      trapFocus.close()
    }
  }

  initResults () {
    const resultsContainerElm = document.createElement('div')
    resultsContainerElm.classList.add('quicksearch')
    resultsContainerElm.innerHTML = resultsContainerTemplate()
    this.append(resultsContainerElm)
    this.style.position = 'relative'
    return resultsContainerElm
  }

  initSearchInput () {
    let oldSearchValue = this.searchInput.value
    this.searchInput.setAttribute('autocomplete', 'off')
    this.searchInput.addEventListener('keyup', () => {
      if (this.searchInput.value === oldSearchValue) { return }

      (this.searchInput.value.length > 0)
        ? this.searchForItems(this.searchInput, this.searchInput.value)
        : this.showResults = false

      oldSearchValue = this.searchInput.value
    })
    return this.searchInput
  }

  async searchForItems (searchInput, searchValue) {
    const { resources: { results: { products: productResults, collections: collectionResults } } } = await this.fetchSearchResults(searchValue)

    const productResultsHolder = this.querySelector('[data-quicksearch-products]')
    if (productResultsHolder && typeof productResults !== 'undefined') {
      productResultsHolder.innerHTML = productResultsTemplate(productResults)
    }

    const collectionResultsHolder = this.querySelector('[data-quicksearch-collections]')
    if (collectionResultsHolder && typeof collectionResults !== 'undefined') {
      collectionResultsHolder.innerHTML = collectionResultsTemplate(collectionResults)
    }

    this.showResults = true
  }

  async fetchSearchResults (searchValue) {
    const searchQuery = [
        `q=${searchValue}`,
        'resources[type]=product,collection',
        'resources[options][unavailable_products]=last',
        'resources[options][fields]=title,product_type,variants.title'
    ].join('&')

    return await fetch(`/search/suggest.json?${searchQuery}`, {
      method: 'GET',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'xmlhttprequest'
      }
    })
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

  accessabilityEvents (addEvent) {
    window.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape' || !this.showResults) { return }
      this.showResults = false
      trapFocus.close()
    }, true)

    window.addEventListener('click', (event) => {
      if (this.contains(event.target) || !this.showResults) { return }
      event.preventDefault()
      event.stopPropagation()
      this.showResults = false
    }, true)

    this.searchInput.addEventListener('keydown', (event) => {
      const firstResult = this.querySelector('[data-quicksearch-result]')
      if (event.key !== 'ArrowDown' || !firstResult || !this.showResults) { return }
      firstResult.focus()
    })

    this.resultsContainer.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowUp' || !this.showResults) { return }
      this.searchInput.focus()
    })
  }
})
