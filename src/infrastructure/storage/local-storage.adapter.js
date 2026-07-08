/**
 * @fileoverview localStorage Storage Adapter.
 * Implements the standard storage interface using window.localStorage.
 * Data is wrapped in metadata envelopes with version, timestamps, and optional TTL.
 */

/** @type {number} Current data envelope version. */
const VERSION = 1;

/**
 * Wraps a value in a metadata envelope.
 * @param {any} value - Data to store.
 * @param {Object} [options] - Storage options.
 * @param {number} [options.ttl] - Time-to-live in milliseconds.
 * @returns {Object} Envelope object.
 */
function wrap(value, options = {}) {
  const now = Date.now();
  const envelope = {
    __version: VERSION,
    __createdAt: now,
    __updatedAt: now,
    data: value,
  };
  if (options.ttl) envelope.__ttl = options.ttl;
  return envelope;
}

/**
 * Checks if a stored envelope has expired based on TTL.
 * @param {Object} envelope - The stored envelope.
 * @returns {boolean} True if expired.
 */
function isExpired(envelope) {
  if (!envelope.__ttl) return false;
  return Date.now() > envelope.__updatedAt + envelope.__ttl;
}

/**
 * Creates a localStorage adapter instance.
 * @returns {Object} Adapter with get, set, delete, clear, keys methods.
 */
function createLocalStorageAdapter() {
  /**
   * Retrieves a value by key.
   * @param {string} key - Storage key.
   * @returns {Promise<any>} Stored value or null.
   */
  async function get(key) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const envelope = JSON.parse(raw);
      if (isExpired(envelope)) {
        localStorage.removeItem(key);
        return null;
      }
      return envelope.data;
    } catch {
      return null;
    }
  }

  /**
   * Stores a value under a key.
   * @param {string} key - Storage key.
   * @param {any} value - Value to store.
   * @param {Object} [options] - Storage options.
   * @param {number} [options.ttl] - Time-to-live in milliseconds.
   * @returns {Promise<void>}
   */
  async function set(key, value, options = {}) {
    const envelope = wrap(value, options);
    localStorage.setItem(key, JSON.stringify(envelope));
  }

  /**
   * Deletes a key from storage.
   * @param {string} key - Key to delete.
   * @returns {Promise<void>}
   */
  async function del(key) {
    localStorage.removeItem(key);
  }

  /**
   * Clears all keys within a namespace prefix.
   * @param {string} namespace - Key prefix.
   * @returns {Promise<void>}
   */
  async function clear(namespace) {
    const toRemove = Object.keys(localStorage).filter(k => k.startsWith(namespace));
    toRemove.forEach(k => localStorage.removeItem(k));
  }

  /**
   * Lists all keys within a namespace prefix.
   * @param {string} namespace - Key prefix.
   * @returns {Promise<string[]>} Array of matching keys.
   */
  async function keys(namespace) {
    return Object.keys(localStorage).filter(k => k.startsWith(namespace));
  }

  return { get, set, delete: del, clear, keys };
}

/** @type {ReturnType<typeof createLocalStorageAdapter>} */
export const LocalStorageAdapter = createLocalStorageAdapter();
