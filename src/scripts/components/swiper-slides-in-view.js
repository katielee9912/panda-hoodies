const updateEntries = (entries) => {
  entries.forEach((entry) => {
    const desktopOnly = entry.target.hasAttribute('data-obverve-desktop-only')

    if (entry.isIntersecting || (desktopOnly && window.innerWidth < 1025)) {
      showVisibility(entry.target)
    } else if (!desktopOnly || window.innerWidth >= 1025) {
      hideVisibility(entry.target)
    }
  })
}

function showVisibility (target) {
  target.removeAttribute('aria-hidden')
  target.querySelectorAll('*').forEach((elm) => elm.removeAttribute('tabindex'))
}

function hideVisibility (target) {
  target.setAttribute('aria-hidden', 'true')
  target.querySelectorAll('*').forEach((elm) => elm.setAttribute('tabindex', -1))
}

export function swiperSlidesInView (swiperContainer, options = { threshold: 1.0, desktopOnly: false }) {
  const slides = [...swiperContainer.querySelectorAll('.swiper-slide')]
    .filter(slide => !slide.hasAttribute('data-observe-init'))

  if (slides.length === 0) { return }
  const observer = new IntersectionObserver(updateEntries, {  // eslint-disable-line
    root: swiperContainer,
    rootMargin: '0px',
    threshold: options.threshold
  })

  slides.forEach((slide) => {
    observer.observe(slide)
    slide.setAttribute('data-observe-init', true)
    slide.toggleAttribute('data-obverve-desktop-only', options.desktopOnly)
  })
}
