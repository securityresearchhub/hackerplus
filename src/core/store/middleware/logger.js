/**
 * @fileoverview Logger middleware for the Store.
 * Logs every dispatched action and the resulting state change to the console.
 */

/**
 * Logger middleware factory.
 * @returns {Function} Middleware function (store) => (next) => (action) => any
 */
export function loggerMiddleware() {
  /**
   * @param {{ getState: Function }} store - Store interface.
   * @returns {Function} Next-chaining function.
   */
  return store => next => action => {
    const prevState = store.getState();
    console.group(`[Store] Action: ${action.type}`);
    console.log('%c prev state', 'color: #9E9E9E; font-weight: bold', prevState);
    console.log('%c action    ', 'color: #03A9F4; font-weight: bold', action);
    const result = next(action);
    const nextState = store.getState();
    console.log('%c next state', 'color: #4CAF50; font-weight: bold', nextState);
    console.groupEnd();
    return result;
  };
}
