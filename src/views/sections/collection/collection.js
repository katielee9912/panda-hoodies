// Import CSS
import './collection.scss'

// Snippets
import '@snippets/collection-filters/collection-filters'
import '@snippets/collection-active-filters/collection-active-filters'
import '@snippets/collection-sorting/collection-sorting'

;(() => {
  if (typeof window.customElements.get('filtered-collection-display') !== 'undefined') { return }

  window.customElements.define('filtered-collection-display',
    class FilteredCollectionDisplay extends HTMLElement { // eslint-disable-line
      constructor () {
        super()

        this.handle = this.getAttribute('data-filtered-collection-display')
        this.path = this.getAttribute('data-url')
        if (!this.handle || !this.path) { return }

        this.sectionId = this.getAttribute('data-section-id')
        this.parentContainerSelector = '[data-filtered-collection-display]'
        this.parentContainerEl = document.querySelector(this.parentContainerSelector)
        this.lastFocusedEl = null
        this.fetchResponseCache = []

        this.setParamStringsFromUrl(window.location.href)
        this.initListeners()
      }

      setParamStringsFromUrl (url) {
        const searchParams = new URL(url).searchParams
        this.sortSearchString = searchParams.has('sort_by') ? `sort_by=${searchParams.get('sort_by')}` : ''
        this.pageSearchString = searchParams.has('page') ? `page=${searchParams.get('page')}` : ''
        searchParams.delete('sort_by')
        searchParams.delete('page')
        this.filterSearchString = searchParams.toString()
      }

      handleFilterUpdate (filterFormdataString, event) {
        this.filterSearchString = filterFormdataString
        this.pageSearchString = ''
        this.updateDisplay({ event })
      }

      handleSortUpdate (sortFormdataString) {
        console.log('sort!')
        this.sortSearchString = sortFormdataString
        this.pageSearchString = ''
        this.updateDisplay()
      }

      handleUrlChange (url, pushState = true) {
        this.setParamStringsFromUrl(url)
        this.updateDisplay({ pushState })
      }

      initListeners () {
        window.addEventListener('popstate', () => {
          this.handleUrlChange(window.location.href, false)
        })
      }

      async updateDisplay ({ pushState = true, event = null }) {
        const params = [
          this.filterSearchString,
          this.sortSearchString,
          this.pageSearchString
        ]
          .filter(params => params.length !== 0)
          .join('&')

        this.classList.add('collection-display-loading')

        const url = `${this.path}?${params}`
        const resDom = await this.fetchCollection(`${url}&section_id=${this.sectionId}`)

        this.updateActiveFilterLinks(resDom)
        this.updateFilterFacets(resDom, event)
        this.updateSortings(resDom)
        this.updateCollectionDisplay(resDom)
        this.updatePaginationDisplay(resDom)

        this.classList.remove('collection-display-loading')

        window.scrollTo({
          top: 0,
          left: 0,
          behaviour: 'smooth'
        })

        if (pushState) {
          window.history.pushState({}, '', url)
        }
      }

      updateFilterFacets (resDom, event = null) {
        const eventFilterFacet = event ? event.target.closest('[data-filter-facet]') : null
        const eventFacetIndex = eventFilterFacet ? eventFilterFacet.dataset.index : null

        const parentFiltersEls = document.querySelectorAll(`[data-collection-filter="${this.handle}"]`)
        const resParentFiltersEls = resDom.querySelectorAll(`[data-collection-filter="${this.handle}"]`)

        parentFiltersEls.forEach((parentFiltersEl) => {
          const filterFacetEls = parentFiltersEl.querySelectorAll('[data-filter-facet]')
          const matchingResParentFilterEl = [...resParentFiltersEls].find(resFilterParentEl => resFilterParentEl.dataset.filterId === parentFiltersEl.dataset.filterId)

          filterFacetEls.forEach(filterFacetEl => {
            if (eventFacetIndex && filterFacetEl.dataset.index === eventFacetIndex) { return }

            const matchingResFacetEl = matchingResParentFilterEl.querySelector(`[data-filter-facet][data-index="${filterFacetEl.dataset.index}"]`)

            filterFacetEl.classList.toggle('d-none', !matchingResFacetEl)

            if (!matchingResFacetEl) { return }

            filterFacetEl.querySelector('[data-accordion-content]').innerHTML = matchingResFacetEl.querySelector('[data-accordion-content]').innerHTML
          })
        })
      }

      updateActiveFilterLinks (resDom) {
        const activeFiltersEls = document.querySelectorAll(`[data-active-filters="${this.handle}"]`)
        const resActiveFiltersEl = resDom.querySelector(`[data-active-filters="${this.handle}"]`)

        activeFiltersEls.forEach((activeFiltersEl) => {
          activeFiltersEl.innerHTML = resActiveFiltersEl.innerHTML
        })
      }

      updateSortings (resDom) {
        const resSortings = resDom.querySelectorAll(`[data-collection-sorting="${this.handle}"]`)
        const sortings = document.querySelectorAll(`[data-collection-sorting="${this.handle}"]`)
        sortings.forEach((sorting, index) => {
          if (typeof resSortings[index] === 'undefined') { return }
          sorting.innerHTML = resSortings[index].innerHTML
        })
      }

      updateCollectionDisplay (resDom) {
        const resGrids = resDom.querySelectorAll(`[data-filtered-collection-display="${this.handle}"]`)
        const grids = document.querySelectorAll(`[data-filtered-collection-display="${this.handle}"]`)
        grids.forEach((grid, index) => {
          if (typeof resGrids[index] === 'undefined') { return }
          grid.innerHTML = resGrids[index].innerHTML
        })
      }

      updatePaginationDisplay (resDom) {
        const resPaginationEls = resDom.querySelectorAll(`[data-collection-pagination="${this.handle}"]`)
        const paginationEls = document.querySelectorAll(`[data-collection-pagination="${this.handle}"]`)
        paginationEls.forEach((paginationEl, index) => {
          if (typeof resPaginationEls[index] === 'undefined') { return }
          paginationEl.innerHTML = resPaginationEls[index].innerHTML
        })
      }

      async fetchCollection (url) {
        let responseHtml = null

        const cachedResponse = this.fetchResponseCache.find(res => res.url === url)

        if (cachedResponse) {
          responseHtml = cachedResponse.html
        } else {
          responseHtml = await fetch(url)
            .then((response) => {
              return response.text()
            }).then((html) => {
              return html
            }).catch((err) => {
              console.error(err)
              return null
            })

          this.fetchResponseCache.push({
            url,
            html: responseHtml
          })
        }

        const responseDOMParser = new window.DOMParser()
        const responseDocument = responseDOMParser.parseFromString(responseHtml, 'text/html')
        return responseDocument
      }
    }
  )
})()

;(() => {
  if (typeof window.customElements.get('collection-pagination') !== 'undefined') { return }

  window.customElements.define('collection-pagination',
    class FilteredCollectionDisplay extends HTMLElement { // eslint-disable-line
      constructor () {
        super()

        this.collectionEl = document.querySelector('filtered-collection-display')
        this.linkEls = this.querySelectorAll('a')

        if (this.collectionEl && this.linkEls.length) {
          this.init()
        }
      }

      init () {
        this.linkEls.forEach(linkEl => {
          linkEl.addEventListener('click', (event) => {
            event.preventDefault()
            this.collectionEl.handleUrlChange(linkEl.href)
          })
        })
      }
    }
  )
})()
