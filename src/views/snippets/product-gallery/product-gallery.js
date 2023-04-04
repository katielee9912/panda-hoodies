import newCustomElement from '@scripts/core/custom-html-element'

newCustomElement('product-gallery-carousel', class extends HTMLElement {
  constructor () {
    super()
    this.parentProductEl = this.closest('product-wrap')
    this.slideEls = this.querySelectorAll('[data-product-gallery-slide]')
    this.mediaEls = this.querySelectorAll('[data-product-media-item]')
    this.paginationStyle = this.getAttribute('data-pagination-style')
    this.isFilterItemsByColor = this.getAttribute('data-filter-by-color')
    this.colorOptionIndex = this.getAttribute('data-color-option-index')
    this.activeSlide = [...this.slideEls].find(slide => slide.matches('[data-first-slide-index]'))
    this.filteredSlides = [...this.slideEls]
    this.swiper = null
    this.thumbSwiper = null
    this.variantData = {}
  }

  initCarouselGallery () {
    if (this.isFilterItemsByColor === 'true') {
      this.filteredSlides = this.filterItemsByColor()

      if (this.filteredSlides.length) {
        const filteredItemIds = this.filteredSlides.map(slide => slide.dataset.mediaId)

        this.slideEls.forEach(slideEl => {
          slideEl.classList.remove('hide')
          if (!filteredItemIds.includes(slideEl.dataset.mediaId)) {
            slideEl.remove()
          }
        })
      }
    } else {
      this.slideEls.forEach(slideEl => {
        slideEl.classList.remove('hide')
      })
    }

    if (this.paginationStyle === 'thumbnail_carousel') {
      this.thumbSwiper = this.initPaginationSwiper()
    }

    this.swiper = this.initSwiper()
  }

  buildPaginationSwiperSlides () {
    return this.filteredSlides.map(slide => {
      return `<div class="swiper-slide swiper-pagination-thumbnail swiper-pagination-thumbnail--slide">${slide.dataset.thumbImage}</div>`
    })
  }

  filterItemsByColor () {
    const variantColor = this.variantData[`option${this.colorOptionIndex}`]
    if (!variantColor) { return [...this.slideEls] }

    return [...this.slideEls].filter(slide => {
      const slideAltSplit = slide.dataset.altText.split('|')
      const slideColor = slideAltSplit.length > 1 ? slideAltSplit[1].trim() : false
      return !slideColor || slideColor === variantColor
    })
  }

  initSwiper () {
    const paginationEl = this.querySelector('[data-product-gallery-pagination]')

    const swiperOptions = {
      loop: false,
      slidesPerView: 1,
      threshold: 5,
      observer: true,
      observeParents: true
    }

    if (this.activeSlide) {
      swiperOptions.initialSlide = Number(this.activeSlide.getAttribute('data-first-slide-index'))
    }

    if (this.paginationStyle === 'dots') {
      swiperOptions.pagination = {
        el: paginationEl,
        clickable: true,
        type: 'bullets'
      }
    } else if (this.paginationStyle === 'thumbnail_carousel') {
      swiperOptions.thumbs = {
        swiper: this.thumbSwiper,
        autoScrollOffset: 1
      }
    } else if (this.paginationStyle === 'thumbnails') {
      swiperOptions.pagination = {
        el: paginationEl,
        clickable: true,
        bulletClass: 'swiper-pagination-thumbnail',
        renderBullet: (index, className) => {
          const matchingSlide = this.filteredSlides.find((slide, i) => i === index)
          if (!matchingSlide) { return '' }
          return `<span class="${className}">${matchingSlide.dataset.thumbImage}</span>`
        }
      }
    }

    return new Swiper(this, swiperOptions)
  }

  initPaginationSwiper () {
    const thumbSliderEl = this.querySelector('[data-product-gallery-thumbs-slider]')
    const swiperOptions = {
      loop: false,
      slidesPerView: 'auto',
      observer: true,
      observeParents: true
    }

    if (this.activeSlide) {
      swiperOptions.initialSlide = Number(this.activeSlide.getAttribute('data-first-slide-index'))
    }

    const thumbSwiper = new Swiper(thumbSliderEl, swiperOptions)

    const thumbSlides = this.buildPaginationSwiperSlides()

    thumbSwiper.appendSlide(thumbSlides)
    thumbSwiper.update()

    return thumbSwiper
  }

  set selectedVariant (variantJson) {
    this.variantData = variantJson

    if (!this.swiper) {
      this.initCarouselGallery()
      return
    }

    if (this.isFilterItemsByColor === 'true') {
      this.filteredSlides = this.filterItemsByColor()

      // Update main slider
      this.swiper.removeAllSlides()
      this.swiper.appendSlide(this.filteredSlides)
      this.swiper.update()
      this.swiper.slideTo(0, false)

      // Update thumbnail carousel
      if (this.thumbSwiper) {
        const filteredThumbs = this.buildPaginationSwiperSlides()
        this.thumbSwiper.removeAllSlides()
        this.thumbSwiper.appendSlide(filteredThumbs)
        this.thumbSwiper.update()
        this.thumbSwiper.slideTo(0, false)
      }
    } else {
      const matchingMediaItem = [...this.mediaEls].find(mediaItem => mediaItem.dataset.variantIds?.includes(variantJson.id))
      if (!matchingMediaItem) { return }
      const slideIndex = Number(matchingMediaItem.dataset.itemIndex)
      this.swiper.slideTo(slideIndex, false)

      if (this.thumbSwiper) {
        this.thumbSwiper.slideTo(slideIndex, false)
      }
    }
  }

  get selectedVariant () {
    return this.variantData
  }
})

newCustomElement('product-gallery-simple', class extends HTMLElement {
  constructor () {
    super()

    this.productEl = this.closest('product-wrap')
    this.thumbnails = this.productEl.querySelectorAll('[data-product-thumbnail]')
    this.mediaItems = this.querySelectorAll('[data-product-media-item]')
    this.isFilterItemsByColor = this.dataset.filterByColor === 'true'
    this.colorOptionIndex = this.dataset.colorOptionIndex
    this.selectedVariant = null

    this.simpleGalleryInit()
  }

  simpleGalleryInit () {
    this.thumbnails.forEach(thumbnail => {
      thumbnail.addEventListener('click', () => {
        this.mediaItems.forEach(mediaItem => {
          const isClickedButton = mediaItem.dataset.mediaId === thumbnail.dataset.mediaId
          mediaItem.classList.toggle('hide', !isClickedButton)
        })

        this.thumbnails.forEach(btn => {
          const isClickedButton = btn === thumbnail
          btn.classList.toggle('active', isClickedButton)
          btn.setAttribute('aria-select', isClickedButton)
        })
      })
    })
  }

  set selectedVariant (variantJson) {
    const variantColor = variantJson[`option${this.colorOptionIndex}`]
    const activeMediaItem = [...this.mediaItems].find(mediaItem => mediaItem.dataset.variantIds?.includes(variantJson.id))
    if (!variantColor || !activeMediaItem || this.isFilterItemsByColor === false) { return }

    this.mediaItems.forEach(mediaItem => {
      mediaItem.classList.toggle('hide', mediaItem !== activeMediaItem)
    })

    const activeThumbnail = [...this.thumbnails].find(thumbnail => thumbnail.dataset.mediaId === activeMediaItem.dataset.mediaId)
    this.thumbnails.forEach(thumb => {
      const isActiveButton = thumb === activeThumbnail
      const itemAltSplit = thumb.dataset.altText.split('|')
      const thumbColor = itemAltSplit.length > 1 ? itemAltSplit[1].trim() : false

      thumb.classList.toggle('active', isActiveButton)
      thumb.setAttribute('aria-selected', isActiveButton)
      thumb.classList.toggle('hide', thumbColor && thumbColor !== variantColor)
    })
  }

  get selectedVariant () {
    return this.selectedVariant
  }
})

newCustomElement('product-gallery-grid', class extends HTMLElement {
  constructor () {
    super()

    this.gridItems = this.querySelectorAll('[data-grid-gallery-item]')
    this.colorOptionIndex = this.dataset.colorOptionIndex
    this.isFilterItemsByColor = this.dataset.filterByColor === 'true'
    this.selectedVariant = null
  }

  set selectedVariant (variantJson) {
    const variantColor = variantJson[`option${this.colorOptionIndex}`]
    if (!variantColor || this.isFilterItemsByColor === false) { return }

    this.gridItems.forEach(gridItem => {
      const itemAltSplit = gridItem.dataset.altText.split('|')
      const itemColor = itemAltSplit.length > 1 ? itemAltSplit[1].trim() : false
      gridItem.classList.toggle('hide', itemColor && itemColor !== variantColor)
    })
  }

  get selectedVariant () {
    return this.selectedVariant
  }
})
