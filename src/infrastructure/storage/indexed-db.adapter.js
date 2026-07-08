/**
 * @fileoverview IndexedDB Storage Adapter.
 * Implements the standard storage interface using IndexedDB.
 * Data is wrapped in metadata envelopes with version, timestamps, and optional TTL.
 */

/** @type {string} Database name. */
const DB_NAME = 'hackerplus_db';
/** @type {number} Database version. */
const DB_VERSION = 1;
/** @type {string} Default object store name. */
const STORE_NAME = 'keyval';
/** @type {number} Current data envelope version. */
const VERSION = 1;

/**
 * Opens the IndexedDB database, creating the object store if needed.
 * @returns {Promise<IDBDatabase>} Opened database instance.
 */
function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = e => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = e => resolve(e.target.result);
    req.onerror = e => reject(e.target.error);
  });
}

/**
 * Wraps a value in a metadata envelope.
 * @param {any} value - Value to store.
 * @param {Object} [options] - Storage options.
 * @param {number} [options.ttl] - Time-to-live in ms.
 * @returns {Object} Envelope object.
 */
function wrap(value, options = {}) {
  const now = Date.now();
  const envelope = { __version: VERSION, __createdAt: now, __updatedAt: now, data: value };
  if (options.ttl) envelope.__ttl = options.ttl;
  return envelope;
}

/**
 * Checks if an envelope has expired.
 * @param {Object} envelope - Stored envelope.
 * @returns {boolean} True if expired.
 */
function isExpired(envelope) {
  if (!envelope.__ttl) return false;
  return Date.now() > envelope.__updatedAt + envelope.__ttl;
}

/**
 * Runs an IndexedDB transaction and returns a promise.
 * @param {string} mode - 'readonly' or 'readwrite'.
 * @param {Function} fn - Receives the object store and returns an IDBRequest or value.
 * @returns {Promise<any>} Resolved with the request result.
 */
async function txn(mode, fn) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, mode);
    const store = tx.objectStore(STORE_NAME);
    const req = fn(store);
    if (req && typeof req.onsuccess !== 'undefined') {
      req.onsuccess = e => resolve(e.target.result);
      req.onerror = e => reject(e.target.error);
    } else {
      tx.oncomplete = () => resolve(req);
      tx.onerror = e => reject(e.target.error);
    }
  });
}

/**
 * Creates an IndexedDB adapter instance.
 * @returns {Object} Adapter with get, set, delete, clear, keys methods.
 */
function createIndexedDBAdapter() {
  /**
   * Retrieves a value by key.
   * @param {string} key - Storage key.
   * @returns {Promise<any>} Stored value or null.
   */
  async function get(key) {
    try {
      const envelope = await txn('readonly', store => store.get(key));
      if (!envelope) return null;
      if (isExpired(envelope)) {
        await del(key);
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
   * @returns {Promise<void>}
   */
  async function set(key, value, options = {}) {
    const envelope = wrap(value, options);
    await txn('readwrite', store => store.put(envelope, key));
  }

  /**
   * Deletes a key from storage.
   * @param {string} key - Key to delete.
   * @returns {Promise<void>}
   */
  async function del(key) {
    await txn('readwrite', store => store.delete(key));
  }

  /**
   * Clears all keys within a namespace prefix.
   * @param {string} namespace - Key prefix to match.
   * @returns {Promise<void>}
   */
  async function clear(namespace) {
    const allKeys = await keys(namespace);
    await Promise.all(allKeys.map(k => del(k)));
  }

  /**
   * Lists all keys matching a namespace prefix.
   * @param {string} namespace - Key prefix.
   * @returns {Promise<string[]>} Matching keys.
   */
  async function keys(namespace) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAllKeys();
      req.onsuccess = e => resolve(e.target.result.filter(k => String(k).startsWith(namespace)));
      req.onerror = e => reject(e.target.error);
    });
  }

  return { get, set, delete: del, clear, keys };
}

/** @type {ReturnType<typeof createIndexedDBAdapter>} */
export const IndexedDBAdapter = createIndexedDBAdapter();
