/** Utilities for working with URLs. */


/**
 * Return an object representation of the query string.
 *
 * Given a URL, return an object mapping the keys in the query
 * string to their corresponding values as strings. If the URL has no
 * query string, then an empty object is returned.
 *
 * @param {String} url - The URL from which to parse the query string.
 *
 * @return {Object} An object mapping the query string's keys to its
 *   values.
 */
function parseQueryString(url) {
  const queryParams = {};

  const queryString = url.split('?')[1] || '';

  const queryBits = queryString.split('&');

  for (let i = 0; i < queryBits.length; i++) {
    const [key, val] = queryBits[i].split('=');
    queryParams[key] = val;
  }

  return queryParams;
}


export {
  parseQueryString
};
