/**
 * @desc Queries a variant information by id
 * @param {Array or Number} ids -> Array of variant ids or single
 */

const queryVariantsById = (ids) => {
  const graphQlVariables = {
    ids: Array.isArray(ids)
      ? ids.map(id => `gid://shopify/ProductVariant/${id}`)
      : [`gid://shopify/ProductVariant/${ids}`]
  }

  const graphQlQuery = `
    query($ids: [ID!]!) {
      nodes(ids: $ids) {
        ... on ProductVariant {
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
          sellingPlanAllocations(first:100) {
            edges {
              node {
                sellingPlan {
                  id
                  name
                  options {
                    name
                    value
                  }
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

export default queryVariantsById
