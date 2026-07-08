/**
 * @fileoverview Local Auth Adapter.
 * Provides authentication persistence using localStorage.
 * Stores users, sessions, and tokens locally for the browser-only app.
 */

import { LocalStorageAdapter } from '../storage/local-storage.adapter.js';
import { hashPassword, generateToken, generateUUID } from '../../core/utils/crypto.js';

/** @type {string} Storage key for users map. */
const USERS_KEY = 'hackerplus:auth:users';
/** @type {string} Storage key for the current session token. */
const SESSION_KEY = 'hackerplus:auth:session';
/** @type {number} Session TTL: 7 days in ms. */
const SESSION_TTL = 7 * 24 * 60 * 60 * 1000;

/**
 * Loads all registered users from storage.
 * @returns {Promise<Object>} Map of email -> user record.
 */
async function loadUsers() {
  const users = await LocalStorageAdapter.get(USERS_KEY);
  return users || {};
}

/**
 * Saves all users to storage.
 * @param {Object} users - Map of email -> user record.
 * @returns {Promise<void>}
 */
async function saveUsers(users) {
  await LocalStorageAdapter.set(USERS_KEY, users);
}

/**
 * Registers a new user locally.
 * @param {string} email - User email.
 * @param {string} password - Plain-text password.
 * @param {string} username - Username.
 * @returns {Promise<{ok: boolean, data?: Object, error?: string}>}
 */
export async function register(email, password, username) {
  const users = await loadUsers();
  if (users[email]) {
    return { ok: false, error: 'An account with this email already exists.' };
  }
  const passwordHash = await hashPassword(password, email);
  const user = {
    id: generateUUID(),
    email,
    username,
    passwordHash,
    avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${username}`,
    joinedAt: new Date().toISOString(),
    bio: '',
  };
  users[email] = user;
  await saveUsers(users);
  const { passwordHash: _, ...safeUser } = user;
  return { ok: true, data: safeUser };
}

/**
 * Authenticates a user and creates a session token.
 * @param {string} email - User email.
 * @param {string} password - Plain-text password.
 * @returns {Promise<{ok: boolean, data?: Object, error?: string}>}
 */
export async function login(email, password) {
  const users = await loadUsers();
  const user = users[email];
  if (!user) return { ok: false, error: 'No account found with this email.' };

  const hash = await hashPassword(password, email);
  if (hash !== user.passwordHash) return { ok: false, error: 'Incorrect password.' };

  const token = generateToken();
  await LocalStorageAdapter.set(SESSION_KEY, { token, email }, { ttl: SESSION_TTL });
  const { passwordHash: _, ...safeUser } = user;
  return { ok: true, data: { user: safeUser, token } };
}

/**
 * Ends the current session.
 * @returns {Promise<{ok: boolean}>}
 */
export async function logout() {
  await LocalStorageAdapter.delete(SESSION_KEY);
  return { ok: true };
}

/**
 * Returns the current logged-in user from the active session.
 * @returns {Promise<{ok: boolean, data?: Object, error?: string}>}
 */
export async function getCurrentUser() {
  const session = await LocalStorageAdapter.get(SESSION_KEY);
  if (!session) return { ok: false, error: 'No active session.' };

  const users = await loadUsers();
  const user = users[session.email];
  if (!user) return { ok: false, error: 'User not found.' };

  const { passwordHash: _, ...safeUser } = user;
  return { ok: true, data: safeUser };
}

/**
 * Updates the current user's profile fields.
 * @param {Object} updates - Fields to update.
 * @returns {Promise<{ok: boolean, data?: Object, error?: string}>}
 */
export async function updateProfile(updates) {
  const session = await LocalStorageAdapter.get(SESSION_KEY);
  if (!session) return { ok: false, error: 'Not authenticated.' };

  const users = await loadUsers();
  const user = users[session.email];
  if (!user) return { ok: false, error: 'User not found.' };

  const forbidden = ['id', 'email', 'passwordHash', 'joinedAt'];
  const filtered = Object.fromEntries(
    Object.entries(updates).filter(([k]) => !forbidden.includes(k))
  );
  users[session.email] = { ...user, ...filtered };
  await saveUsers(users);

  const { passwordHash: _, ...safeUser } = users[session.email];
  return { ok: true, data: safeUser };
}
