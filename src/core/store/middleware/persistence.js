/**
 * @fileoverview Persistence middleware for the Store.
 * Persists selected state slices to localStorage after each action.
 */

/** @type {string} localStorage key prefix */
const STORAGE_PREFIX = 'hackerplus:state:';

/** @type {string[]} Slice names to persist. */
const PERSISTED_SLICES = ['auth', 'progress', 'ui'];

/**
 * Persistence middleware factory.
 * Saves selected slices to localStorage after every dispatched action.
 * @returns {Function} Middleware function (store) => (next) => (action) => any
 */
export function persistenceMiddleware() {
  return store => next => action => {
    const result = next(action);
    const state = store.getState();

    PERSISTED_SLICES.forEach(sliceName => {
      if (state[sliceName] !== undefined) {
        try {
          const payload = JSON.stringify(state[sliceName]);
          localStorage.setItem(`${STORAGE_PREFIX}${sliceName}`, payload);
        } catch (err) {
          console.warn(`[Persistence] Failed to persist slice "${sliceName}":`, err);
        }
      }
    });

    return result;
  };
}

/**
 * Loads persisted state slices from localStorage.
 * @returns {Object} Map of slice name to persisted state (or empty object).
 */
export function loadPersistedState() {
  const persisted = {};
  PERSISTED_SLICES.forEach(sliceName => {
    try {
      const raw = localStorage.getItem(`${STORAGE_PREFIX}${sliceName}`);
      if (raw) {
        persisted[sliceName] = JSON.parse(raw);
      }
    } catch (err) {
      console.warn(`[Persistence] Failed to load slice "${sliceName}":`, err);
    }
  });
  return persisted;
}

/**
 * Clears all persisted state from localStorage.
 */
export function clearPersistedState() {
  PERSISTED_SLICES.forEach(sliceName => {
    localStorage.removeItem(`${STORAGE_PREFIX}${sliceName}`);
  });
}
