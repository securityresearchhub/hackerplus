/**
 * @fileoverview String utility functions used across the HackerPlus app.
 */

/**
 * Converts a string to a URL-friendly slug.
 * @param {string} str - Input string.
 * @returns {string} Slugified string.
 */
export function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Capitalizes the first letter of each word in a string.
 * @param {string} str - Input string.
 * @returns {string} Title-cased string.
 */
export function toTitleCase(str) {
  return str.replace(/\b\w/g, char => char.toUpperCase());
}

/**
 * Truncates a string to a max length, appending an ellipsis if needed.
 * @param {string} str - Input string.
 * @param {number} maxLen - Maximum character length.
 * @returns {string} Truncated string.
 */
export function truncate(str, maxLen = 100) {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 3) + '...';
}

/**
 * Generates a random alphanumeric ID string.
 * @param {number} [length=12] - Length of the ID.
 * @returns {string} Random ID string.
 */
export function generateId(length = 12) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Strips all HTML tags from a string.
 * @param {string} html - HTML string.
 * @returns {string} Plain text string.
 */
export function stripHtml(html) {
  return html.replace(/<[^>]*>/g, '');
}

/**
 * Pads a number with leading zeros to reach a target length.
 * @param {number} num - Number to pad.
 * @param {number} [size=2] - Target string length.
 * @returns {string} Zero-padded string.
 */
export function zeroPad(num, size = 2) {
  let s = String(num);
  while (s.length < size) s = '0' + s;
  return s;
}
