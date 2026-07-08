/**
 * @fileoverview Date utility functions for HackerPlus.
 */

/**
 * Formats a date or timestamp as a human-readable string.
 * @param {Date|number|string} date - Date to format.
 * @param {string} [locale='en-US'] - Locale string.
 * @returns {string} Formatted date string.
 */
export function formatDate(date, locale = 'en-US') {
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Returns a relative time string (e.g. "3 days ago").
 * @param {Date|number|string} date - Date to compare.
 * @returns {string} Relative time string.
 */
export function timeAgo(date) {
  const now = Date.now();
  const then = new Date(date).getTime();
  const diff = Math.floor((now - then) / 1000);

  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return formatDate(date);
}

/**
 * Returns today's date as a YYYY-MM-DD string in local time.
 * @returns {string} Today's date string.
 */
export function todayString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Returns the difference in whole days between two dates.
 * @param {Date|string} a - First date.
 * @param {Date|string} b - Second date.
 * @returns {number} Number of days between the dates.
 */
export function daysBetween(a, b) {
  const msPerDay = 86400000;
  const da = new Date(a).setHours(0, 0, 0, 0);
  const db = new Date(b).setHours(0, 0, 0, 0);
  return Math.round(Math.abs(db - da) / msPerDay);
}

/**
 * Checks whether a given date string represents today.
 * @param {string} dateStr - YYYY-MM-DD date string.
 * @returns {boolean} True if the date is today.
 */
export function isToday(dateStr) {
  return dateStr === todayString();
}

/**
 * Checks whether a given date string represents yesterday.
 * @param {string} dateStr - YYYY-MM-DD date string.
 * @returns {boolean} True if the date is yesterday.
 */
export function isYesterday(dateStr) {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const y = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
  return dateStr === y;
}
