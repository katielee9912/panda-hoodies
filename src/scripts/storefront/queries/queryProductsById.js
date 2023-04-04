/**
 * @desc Queries a product information by id
 * @param {Array or Number} ids -> Array of product ids or single
 */

const queryProductsById = (ids) => {
  const graphQlVariables = {
    ids: Array.isArray(ids)
      ? ids.map(id => `gid://shopify/Product/${id}`)
      : [`gid://shopify/Product/${ids}`]
  }

  const graphQlQuery = `
  query($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on Product {
        id
        publishedAt
        title
        totalInventory
        handle
        options(first: 100) {
          id
          name
        }
        variants(first: 100) {
          edges {
            node {
              title
              id
              compareAtPrice
              availableForSale
              price
              quantityAvailable
              selectedOptions {
                name
                value
              }
            }
          }
        }
      }
    }
  }
  `

  return JSON.stringify({
    query: graphQlQuery,
    variables: graphQlVariables
  })
}

export default queryProductsById
