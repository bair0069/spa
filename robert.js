/**
 * @module SWAPI_SPA_DEMO
 * @author Robert McKenney <mckennr@algonquincollege.com>
 * A simple SPA demo combining ES Modules, fetch, Map, History and localStorage.
 */

import {getSWAPI} from './swapi.service.js'

const STORAGE_KEY = 'lastNavRoute'
const routes = {}
const links = new Map()
let currentPageId = 'films'

/** Set up the initial application state */
export function main() {
  defineRoutes()
  defineNavLinks()
  setInitialPage()
}

/**
 * Get all of the elements with class 'page'.
 * Loop over that nodeList and add them to the top level routes object
 * with the value of the `id` attribute as the object key.
 */
function defineRoutes() {
  document.querySelectorAll('.page').forEach(page => {
    routes[page.id] = page
  })
}

/**
 * Get all of the elements with class 'nav-item'.
 * Loop over that nodeList and add an click event listener to each element,
 * then add them to the top level routes object
 * with the value of the hash path route name as the object key.
 */
function defineNavLinks() {
  document.querySelectorAll('.nav-item').forEach(link => {
    link.addEventListener('click', handleClick)
    const routeName = getRouteFromURL(link.href)
    links.set(routeName, link)
  })
}

/**
 * On the click of a nav link, parse the selected URL
 * from the link element and navigate to the active page.
 * @param {*} event The click event object
 */
function handleClick(event) {
  event.preventDefault()
  const pageId = getRouteFromURL(event.target.href)
  navigate(pageId)
}

/**
 * Parse the hash route name from the URL
 * @param {string} url
 */
function getRouteFromURL(url) {
  return url.split('#')[1]
}

/**
 * Navigate to the initial page.
 * If there is a hash route in the URL, use that. Else,
 * retrieve the last nav route from localStorage.
 * If none of the above, use the default value of the `currentPageId`.
 */
function setInitialPage() {
  let hash = location.hash
  hash = hash.replace('#', '')
  if (hash && hash in routes) return navigate(hash)

  const initialNavRoute = localStorage.getItem(STORAGE_KEY) || currentPageId
  navigate(initialNavRoute)
}

/**
 * Set the `active` class on the page and nav link elements
 * matching the given `pageId`.
 * @param {string} pageId
 */
function navigate(pageId) {
  // check if pageId is a valid route
  if (!pageId in routes) return

  // cache the current route and update location history
  currentPageId = pageId
  localStorage.setItem(STORAGE_KEY, pageId)
  history.pushState({}, '', '#' + pageId)

  // update the active nav-link
  links.forEach(link => link.classList.remove('active'))
  links.get(pageId).classList.add('active')

  // update the active page
  Object.values(routes).forEach(page => page.classList.remove('active'))
  routes[pageId].classList.add('active')
  updatePageContent(pageId)
}

async function updatePageContent(pageId) {
  const page = routes[pageId]
  page.innerHTML = `<h1>Loading ${pageId}</h1>`
  try {
    const payload = await getSWAPI(pageId)
    page.innerHTML = `<pre>${JSON.stringify(payload.results, null, 2)}</pre>`
  } catch (error) {
    console.error(error)
    page.innerHTML = `<h1>${error.message}</h1>`
  }
}