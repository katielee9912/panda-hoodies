(() => {
  if (typeof window.customElements.get('collection-active-filters') !== 'undefined') { return }

  window.customElements.define('collection-active-filters',
    class CollectionActiveFilters extends HTMLElement { // eslint-disable-line
      constructor () {
        super()

        this.collectionEl = document.querySelector(`[data-filtered-collection-display="${this.getAttribute('data-collection')}"]`)
        if (!this.collectionEl) { return }

        this.initRemoveButtons()
      }

      initRemoveButtons () {
        const removeButtonEls = this.querySelectorAll('[data-remove-filter-btn]')
        removeButtonEls.forEach(removeButtonEl => {
          removeButtonEl.addEventListener('click', (event) => {
            event.preventDefault()
            this.collectionEl.handleUrlChange(removeButtonEl.href)
          })
        })
      }
    }
  )
})()
