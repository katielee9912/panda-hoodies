(() => {
  if (typeof window.customElements.get('collection-filters') !== 'undefined') { return }

  window.customElements.define('collection-filters',
    class CollectionFilters extends HTMLElement { // eslint-disable-line
      constructor () {
        super()

        this.filterOptions = [...this.querySelectorAll('[data-filter-option]')]
        this.removeFilterBtns = [...this.querySelectorAll('[data-remove-filter-btn]')]
        this.collectionEl = document.querySelector(`[data-filtered-collection-display="${this.getAttribute('data-collection')}"]`)
        this.form = this.querySelector('form')
        if (!this.collectionEl) { return }

        this.initFilterForm()
        this.initFilterFacetToggles()
      }

      initFilterForm () {
        this.form.addEventListener('change', (event) => {
          this.updateFilter(event)
        })

        this.removeFilterBtns.forEach(removeButton => {
          removeButton.addEventListener('click', (event) => {
            event.preventDefault()
            this.collectionEl.handleUrlChange(removeButton.href)
          })
        })
      }

      async updateFilter (event) {
        const filterParamString = new URLSearchParams(new window.FormData(this.form)).toString()

        await this.collectionEl.handleFilterUpdate(filterParamString, event)
      }

      initFilterFacetToggles () {
        const collectionStorageHandle = `collectionStorage_${this.getAttribute('data-collection')}`
        const filterFacets = this.querySelectorAll('[data-filter-facet]')
        this.updateFacetStates(filterFacets, collectionStorageHandle)

        filterFacets.forEach((group) => {
          const groupDetails = group.querySelector('details')
          groupDetails.addEventListener('toggle', () => {
            this.saveFacetStates(filterFacets, collectionStorageHandle)
          })
        })
      }

      updateFacetStates (filterFacets, collectionStorageHandle) {
        const savedFacetIdString = localStorage.getItem(collectionStorageHandle) // eslint-disable-line
        if (!savedFacetIdString) { return }

        savedFacetIdString.split(',')
          .forEach((groupID) => {
            const targetFacetDetailEl = this.querySelector(`[data-filter-facet="${groupID}"] details`)
            if (!targetFacetDetailEl) { return }
            targetFacetDetailEl.setAttribute('open', '')
          })
      }

      saveFacetStates (filterFacets, collectionStorageHandle) {
        const stringOfFacetIds = [...filterFacets]
          .filter(facet => facet.querySelector('details[open]'))
          .map(facet => facet.getAttribute('data-filter-facet'))
          .join(',')
        localStorage.setItem(collectionStorageHandle, stringOfFacetIds) // eslint-disable-line
      }
    }
  )
})()
