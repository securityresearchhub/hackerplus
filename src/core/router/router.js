/**
 * @fileoverview Hash-based Router singleton.
 * Supports static routes and parameterized routes (e.g. '#/course/:id').
 */

/**
 * Parses a route pattern and URL hash into matched params.
 * @param {string} pattern - Route pattern (e.g. '#/course/:id').
 * @param {string} hash - Current location hash (e.g. '#/course/abc').
 * @returns {Object|null} Params map if matched, null otherwise.
 */
function matchRoute(pattern, hash) {
  const patternParts = pattern.split('/');
  const hashParts = hash.split('/');

  if (patternParts.length !== hashParts.length) return null;

  const params = {};
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(':')) {
      params[patternParts[i].slice(1)] = decodeURIComponent(hashParts[i]);
    } else if (patternParts[i] !== hashParts[i]) {
      return null;
    }
  }
  return params;
}

/**
 * Creates the Router singleton.
 * @returns {Object} Router instance.
 */
function createRouter() {
  /** @type {Map<string, Function>} Registered route handlers. */
  const routes = new Map();

  /** @type {string} Current route hash. */
  let currentRoute = '';

  /** @type {Object} Current parsed route params. */
  let currentParams = {};

  /**
   * Processes the current window hash against registered routes.
   */
  function handleRoute() {
    const hash = window.location.hash || '#/';
    currentRoute = hash;
    currentParams = {};

    for (const [pattern, handler] of routes) {
      const params = matchRoute(pattern, hash);
      if (params !== null) {
        currentParams = params;
        handler(params);
        return;
      }
    }

    // Fallback: try exact match with no params
    const fallback = routes.get('*');
    if (fallback) fallback({});
  }

  /**
   * Registers a handler for the given route pattern.
   * @param {string} pattern - Route pattern (e.g. '#/dashboard' or '#/course/:id').
   * @param {Function} handler - Called with params when route matches.
   */
  function on(pattern, handler) {
    routes.set(pattern, handler);
  }

  /**
   * Removes the handler for the given route pattern.
   * @param {string} pattern - Route pattern to remove.
   */
  function off(pattern) {
    routes.delete(pattern);
  }

  /**
   * Navigates to the given hash route.
   * @param {string} hash - Hash string (e.g. '#/dashboard').
   */
  function navigate(hash) {
    window.location.hash = hash;
  }

  /**
   * Starts listening to hashchange and processes the initial route.
   */
  function init() {
    window.addEventListener('hashchange', handleRoute);
    handleRoute();
  }

  /**
   * Returns the current route hash string.
   * @returns {string} Current route.
   */
  function getCurrentRoute() {
    return currentRoute;
  }

  /**
   * Returns the current parsed route parameters.
   * @returns {Object} Params object.
   */
  function getParams() {
    return { ...currentParams };
  }

  return { on, off, navigate, init, getCurrentRoute, getParams };
}

/** @type {ReturnType<typeof createRouter>} */
export const Router = createRouter();
