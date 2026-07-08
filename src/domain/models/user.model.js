/**
 * @fileoverview User domain model factory.
 * Provides validation and construction of user objects.
 */

/**
 * Creates a normalized user object from raw data.
 * @param {Object} raw - Raw user data.
 * @returns {Object} Normalized user object.
 */
export function createUser(raw = {}) {
  return {
    id: raw.id || null,
    email: raw.email || '',
    username: raw.username || '',
    avatar: raw.avatar || '',
    joinedAt: raw.joinedAt || new Date().toISOString(),
    bio: raw.bio || '',
  };
}

/**
 * Checks if a user object is considered valid (has required fields).
 * @param {Object} user - User object to validate.
 * @returns {boolean} True if user is valid.
 */
export function isValidUser(user) {
  return (
    user &&
    typeof user.id === 'string' &&
    user.id.length > 0 &&
    typeof user.email === 'string' &&
    user.email.length > 0 &&
    typeof user.username === 'string' &&
    user.username.length > 0
  );
}

/**
 * Returns a display-safe user object (strips sensitive fields).
 * @param {Object} user - Full user object.
 * @returns {Object} Safe user for display.
 */
export function toPublicUser(user) {
  const { id, username, avatar, joinedAt, bio } = user;
  return { id, username, avatar, joinedAt, bio };
}

/**
 * Merges profile updates into an existing user, ignoring protected fields.
 * @param {Object} user - Existing user.
 * @param {Object} updates - Fields to merge.
 * @returns {Object} Updated user.
 */
export function applyProfileUpdate(user, updates) {
  const protected_ = ['id', 'email', 'joinedAt', 'passwordHash'];
  const safe = Object.fromEntries(
    Object.entries(updates).filter(([k]) => !protected_.includes(k))
  );
  return { ...user, ...safe };
}
