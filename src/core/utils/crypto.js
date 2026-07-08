/**
 * @fileoverview Cryptographic utilities using the Web Crypto API.
 * Used for password hashing and token generation.
 */

/**
 * Encodes a string to a Uint8Array buffer.
 * @param {string} str - String to encode.
 * @returns {Uint8Array} Encoded buffer.
 */
function encode(str) {
  return new TextEncoder().encode(str);
}

/**
 * Converts an ArrayBuffer to a hex string.
 * @param {ArrayBuffer} buffer - Buffer to convert.
 * @returns {string} Hex-encoded string.
 */
function bufferToHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Hashes a password using SHA-256 with a salt.
 * @param {string} password - Plain-text password.
 * @param {string} salt - Salt string (usually the user's email or a random value).
 * @returns {Promise<string>} Hex-encoded hash string.
 */
export async function hashPassword(password, salt) {
  const data = encode(`${salt}:${password}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return bufferToHex(hashBuffer);
}

/**
 * Generates a cryptographically random hex token.
 * @param {number} [bytes=16] - Number of random bytes.
 * @returns {string} Hex-encoded token.
 */
export function generateToken(bytes = 16) {
  const buf = new Uint8Array(bytes);
  crypto.getRandomValues(buf);
  return bufferToHex(buf.buffer);
}

/**
 * Hashes an arbitrary string with SHA-256.
 * @param {string} str - String to hash.
 * @returns {Promise<string>} Hex-encoded hash.
 */
export async function sha256(str) {
  const hashBuffer = await crypto.subtle.digest('SHA-256', encode(str));
  return bufferToHex(hashBuffer);
}

/**
 * Generates a UUID v4-like random identifier.
 * @returns {string} UUID string.
 */
export function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (crypto.getRandomValues(new Uint8Array(1))[0] & 15);
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
