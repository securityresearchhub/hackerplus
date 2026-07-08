/**
 * @fileoverview Store - a Redux-like state container with middleware support.
 * Manages the full application state tree with named slice reducers.
 */

import { loggerMiddleware } from './middleware/logger.js';
import { persistenceMiddleware, loadPersistedState } from './middleware/persistence.js';

/**
 * Creates the Store singleton.
 * @returns {Object} Store instance.
 */
function createStore() {
  /** @type {Object} Full state tree keyed by slice name. */
  let state = {};

  /** @type {Map<string, Function>} Registered slice reducers. */
  const reducers = new Map();

  /** @type {Set<Function>} State-change listener callbacks. */
  const listeners = new Set();

  /** @type {Function} Composed dispatch with middleware applied. */
  let dispatch;

  /**
   * Returns the full current state tree.
   * @returns {Object} Current state.
   */
  function getState() {
    return { ...state };
  }

  /**
   * Returns a single named slice from the state.
   * @param {string} name - Slice name.
   * @returns {any} Slice state value.
   */
  function getSlice(name) {
    return state[name];
  }

  /**
   * Runs all registered reducers against an action and updates state.
   * @param {{ type: string, payload?: any }} action - Action to dispatch.
   */
  function baseDispatch(action) {
    let changed = false;
    reducers.forEach((reducer, name) => {
      const prev = state[name];
      const next = reducer(prev, action);
      if (next !== prev) {
        state = { ...state, [name]: next };
        changed = true;
      }
    });
    if (changed) {
      listeners.forEach(listener => listener(state));
    }
  }

  /**
   * Registers a named slice with its reducer and initial state.
   * Merges any persisted state from localStorage.
   * @param {string} name - Slice name.
   * @param {Function} reducer - Reducer function(state, action).
   * @param {any} initialState - Initial slice state.
   */
  function registerSlice(name, reducer, initialState) {
    const persisted = loadPersistedState();
    state = {
      ...state,
      [name]: persisted[name] !== undefined ? { ...initialState, ...persisted[name] } : initialState,
    };
    reducers.set(name, reducer);
  }

  /**
   * Subscribes a listener to state changes.
   * @param {Function} listener - Called with new state on every change.
   * @returns {Function} Unsubscribe function.
   */
  function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  // Build middleware chain
  const storeAPI = { getState, dispatch: action => dispatch(action) };
  const middlewares = [loggerMiddleware(), persistenceMiddleware()];
  const chain = middlewares.map(mw => mw(storeAPI));
  dispatch = chain.reduceRight((next, mw) => mw(next), baseDispatch);

  return { getState, getSlice, dispatch, subscribe, registerSlice };
}

/** @type {ReturnType<typeof createStore>} */
export const Store = createStore();
