/**
 *
 * @param {String} url -> URL to fetch
 * @param {Array} elmQueries (optional) -> Array of query strings
 * @returns Object of different elmQueries
 *
 ---------------------------------------------------------------
 Example:
 ---------------------------------------------------------------
  const elements = await fetchHTML(url, [
    `[data-collection-filters]`,
    `[data-collection-grid]`
  ])
 */

const turnToKey = (query) => {
  const wordArray = query.replace(/\[|\]|data-|"/g, '').replace(/[^\w\s]| /gi, '_').split('_')
  return wordArray.map((word, index) => {
    if (index === 0) { return word }
    return word.charAt(0).toUpperCase() + word.slice(1)
  }).join('')
}

const fetchHTML = async (url, elmQueries = []) => {
  return await fetch(url, {
    credentials: 'same-origin',
    headers: {
      'X-Requested-With': 'xmlhttprequest',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expires: 0
    }
  }).then((response) => {
    return response.text()
  }).then((html) => {
    const responseDOMParser = new window.DOMParser()
    const responseDocument = responseDOMParser.parseFromString(html, 'text/html')

    const resObject = elmQueries.reduce((obj, query) => {
      obj[turnToKey(query)] =
          ((responseDocument.querySelectorAll(query).length > 1) && Array.from(responseDocument.querySelectorAll(query))) ||
          ((responseDocument.querySelectorAll(query).length === 1) && responseDocument.querySelector(query)) ||
          null

      return obj
    }, {
      _documentHTML: responseDocument,
      _url: url
    })

    return resObject
  }).catch((err) => {
    console.error(err)
    return null
  })
}

export default fetchHTML
