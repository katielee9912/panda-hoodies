// Shopify
import { formatMoney } from '@shopify/theme-currency'

Shopify.formatMoney = formatMoney

Shopify.Image = {
  /**
   * Preloads an image in memory and uses the browsers cache to store it until needed.
   *
   * @param {Array} images - A list of image urls
   * @param {String} size - A shopify image size attribute
   */
  preload (images, size) {
    if (typeof images === 'string') {
      images = [images]
    }

    for (let i = 0; i < images.length; i++) {
      const image = images[i]
      this.loadImage(this.getSizedImageUrl(image, size))
    }
  },

  /**
   * Loads and caches an image in the browsers cache.
   * @param {string} path - An image url
   */
  loadImage (path) {
    new window.Image().src = path
  },

  /**
   * Find the Shopify image attribute size
   *
   * @param {string} src
   * @returns {null}
   */
  imageSize (src) {
    const match = src.match(
      /.+_((?:pico|icon|thumb|small|compact|medium|large|grande)|\d{1,4}x\d{0,4}|x\d{1,4})[_.@]/
    )

    if (match) {
      return match[1]
    } else {
      return null
    }
  },

  /**
   * Adds a Shopify size attribute to a URL
   *
   * @param src
   * @param size
   * @returns {*}
   */
  getSizedImageUrl (src, size) {
    if (size === null) {
      return src
    }

    if (size === 'master') {
      return this.removeProtocol(src)
    }

    const match = src.match(/\.(jpg|jpeg|gif|png|bmp|bitmap|tiff|tif|webp)(\?v=\d+)?$/i)

    if (match) {
      const prefix = src.split(match[0])
      const suffix = match[0]

      return this.removeProtocol(`${prefix[0]}_${size}${suffix}`)
    } else {
      return null
    }
  },

  removeProtocol (path) {
    return path.replace(/http(s)?:/, '')
  }
}
