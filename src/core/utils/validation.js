/**
 * @fileoverview Validation utility functions for forms and domain models.
 */

/**
 * Validates an email address format.
 * @param {string} email - Email to validate.
 * @returns {boolean} True if valid email format.
 */
export function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

/**
 * Validates a password meets minimum security requirements.
 * Min 8 characters, at least one letter and one number.
 * @param {string} password - Password to validate.
 * @returns {{ valid: boolean, reason?: string }} Result object.
 */
export function isValidPassword(password) {
  if (!password || password.length < 8) {
    return { valid: false, reason: 'Password must be at least 8 characters.' };
  }
  if (!/[a-zA-Z]/.test(password)) {
    return { valid: false, reason: 'Password must contain at least one letter.' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, reason: 'Password must contain at least one number.' };
  }
  return { valid: true };
}

/**
 * Validates a username format.
 * 3–20 chars, alphanumeric and underscores only.
 * @param {string} username - Username to validate.
 * @returns {{ valid: boolean, reason?: string }} Result object.
 */
export function isValidUsername(username) {
  if (!username || username.length < 3 || username.length > 20) {
    return { valid: false, reason: 'Username must be 3–20 characters.' };
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { valid: false, reason: 'Username may only contain letters, numbers, and underscores.' };
  }
  return { valid: true };
}

/**
 * Checks if a value is a non-empty string.
 * @param {any} value - Value to check.
 * @returns {boolean} True if non-empty string.
 */
export function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Returns a list of field-level validation errors for a plain object.
 * @param {Object} fields - Map of field name to { value, validators[] }.
 * @returns {Object} Map of field name to error string (or null).
 */
export function validateFields(fields) {
  const errors = {};
  for (const [name, { value, validators }] of Object.entries(fields)) {
    let error = null;
    for (const validator of validators) {
      const result = validator(value);
      if (result !== true && result !== undefined) {
        error = result;
        break;
      }
    }
    errors[name] = error;
  }
  return errors;
}
