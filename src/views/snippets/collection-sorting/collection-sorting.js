(() => {
  if (typeof window.customElements.get('collection-sorting') !== 'undefined') { return }

  window.customElements.define('collection-sorting',
    class CollectionSorting extends HTMLElement { // eslint-disable-line
      constructor () {
        super()

        this.sortingSelects = this.querySelectorAll('[data-collection-sorting-select]')
        this.collectionEl = document.querySelector(`[data-filtered-collection-display="${this.getAttribute('data-collection')}"]`)
        this.form = this.querySelector('form')
        if (!this.collectionEl) { return }
        this.initForm()
      }

      initForm () {
        this.form.addEventListener('change', (event) => {
          const sortParamString = new URLSearchParams(new window.FormData(this.form)).toString()
          this.collectionEl.handleSortUpdate(sortParamString)
        })
      }
    }
  )
})()
