/**
 * Returns the full browsing context suggestions json object
 * @returns {Object}
 */
export async function getLocationData () {
  try {
    const res = await fetch('/browsing_context_suggestions.json')
    if (!res.ok) { throw new Error(res.statusText) }
    return await res.json()
  } catch (err) {
    console.error(err)
  }
}

/**
 * Get the name for the current user's country (ex: 'Canada')
 * @returns String
 */
export async function getUserCountry () {
  const data = await getLocationData()
  return data.detected_values.country_name
}

/**
 * Get the handle for the current user's country (ex: 'CA')
 * @returns String
 */
export async function getUserCountryHandle () {
  const data = await getLocationData()
  return data.detected_values.country.handle
}
