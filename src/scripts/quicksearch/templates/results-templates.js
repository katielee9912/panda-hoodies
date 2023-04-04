/**
 * Create the main result container
 * @returns string for container innerHTML
 */
export const resultsContainerTemplate = () => {
  return `
    <div class="quicksearch__collections">
      <h2 class="quicksearch__category-title p">Collections</h2>
      <div class="quicksearch__collections-results" data-quicksearch-collections></div>
    </div>
    <div class="quicksearch__products">
      <h2 class="quicksearch__category-title p">Products</h2>
      <div class="quicksearch__products-results" data-quicksearch-products></div>
    </div>
  `
}

const productResultItemTemplate = (product) => {
  return `
    <div class="quicksearch__product-item">
      <a href="${product.url}" class="quicksearch__product-image">
        ${
          product.featured_image?.url
            ? `<img src="${Shopify.Image.getSizedImageUrl(product.featured_image.url, '150x')}" width="150" height="150" alt="${product.title}">`
            : ''
        }
      </a>

      <div class="quicksearch__product-info">
        <h3 class="quicksearch__product-title p--small">
          <a href="${product.url}" class="quicksearch__product-title-link" data-quicksearch-result>
            ${product.title}
          </a>
        </h3>
        <p class="quicksearch__product-price p--small">
          ${
            (product.compare_at_price_min > product.price_min)
              ? `
                ${Shopify.formatMoney(product.price_min)}
                <s class="quicksearch__product-price-strikethrough">
                  <span class="visually-hidden">Originally priced at</span>
                  ${Shopify.formatMoney(product.compare_at_price_min)}
                </s>
              `
              : Shopify.formatMoney(product.price_min)
          }
        </p>
      </div>
    </div>
  `
}

export const productResultsTemplate = (productResults) => {
  return productResults.length === 0
    ? '<p class="quicksearch__no-results p--small">No products match your search</p>'
    : productResults.map((product) => productResultItemTemplate(product)).join('')
}

/**
 * Create collection result list items
 * @param { object } collection : Collection object
 * @returns string collection result list item
 */

const collectionResultItemTemplate = (collection) => {
  return `
    <li class="quicksearch__collection-list-item p--small">
      <a class="quicksearch__collection-list-link" href="${collection.url}" data-quicksearch-result>
        ${collection.title}
      </a>
    </li>
  `
}

/**
 * Create innerhtml for collection results
 * @param { array } collectionResults : Array of collection onject
 * @returns string of element innerHTML
 */
export const collectionResultsTemplate = (collectionResults) => {
  return collectionResults.length === 0
    ? '<p class="quicksearch__no-results p--small">No collections match your search</p>'
    : `
      <ul class="quicksearch__collection-list">
        ${collectionResults.map((collection) => collectionResultItemTemplate(collection)).join('')
        }
      </ul>
    `
}
