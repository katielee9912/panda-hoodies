(() => {
  if (typeof window.customElements.get('collection-item') !== 'undefined') { return }

  class CollecitonItem extends HTMLElement {
    constructor () {
      super()

      this.colorOptionsInit()
      this.quickviewToggleInit()
    }

    colorOptionsInit () {
      const colorOptionWrap = this.querySelector('[data-product-option-group]')
      const images = this.querySelectorAll('[data-collection-item-image]')
      if (!colorOptionWrap || !images.length) { return }

      colorOptionWrap.addEventListener('change', (event) => {
        const matchingImage = [...images].find(image => image.dataset.color === event.target.value)
        if (!matchingImage) { return }

        images.forEach(image => image.classList.toggle('hide', image !== matchingImage))
      })
    }

    quickviewToggleInit () {
      const quickviewToggle = this.querySelector('[data-quickview-view-toggle]')
      if (!quickviewToggle) { return }

      const quickViewModalContent = document.querySelector('[data-product-quickview-content]')
      const { url, template, sectionId } = quickviewToggle.dataset
      const fetchUrl = new URL(url)

      template && fetchUrl.searchParams.set('view', template)
      sectionId && fetchUrl.searchParams.set('section_id', sectionId)

      quickviewToggle.addEventListener('click', async () => {
        quickViewModalContent.innerHTML = `<p>${window.theme.strings.loading}</p>`

        try {
          const productSectionRes = await fetch(fetchUrl.toString())
          quickViewModalContent.innerHTML = await productSectionRes.text()
        } catch (error) {
          quickViewModalContent.innerHTML = `<p>${window.theme.strings.error}</p>`
          console.error(error)
        }
      })
    }
  }

  window.customElements.define('collection-item', CollecitonItem)
})()
