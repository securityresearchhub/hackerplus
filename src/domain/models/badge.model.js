/**
 * @fileoverview Badge domain model factory.
 * Defines badge shapes and construction helpers.
 */

/**
 * @typedef {Object} Badge
 * @property {string} id - Unique badge identifier.
 * @property {string} name - Display name.
 * @property {string} description - What the badge is for.
 * @property {string} icon - Emoji or icon URL.
 * @property {string} category - 'milestone' | 'course' | 'streak' | 'special'.
 * @property {string} rarity - 'common' | 'rare' | 'epic' | 'legendary'.
 * @property {Object} criteria - Conditions required to earn this badge.
 * @property {number} xpBonus - Bonus XP awarded when earned.
 */

/**
 * Creates a normalized badge object from raw data.
 * @param {Object} raw - Raw badge data.
 * @returns {Badge} Normalized badge.
 */
export function createBadge(raw = {}) {
  return {
    id: raw.id || '',
    name: raw.name || '',
    description: raw.description || '',
    icon: raw.icon || '🏅',
    category: raw.category || 'milestone',
    rarity: raw.rarity || 'common',
    criteria: raw.criteria || {},
    xpBonus: raw.xpBonus || 0,
  };
}

/**
 * Creates an earned-badge record (badge + metadata about when it was earned).
 * @param {Badge} badge - The badge definition.
 * @param {string} [userId] - User ID.
 * @returns {Object} Earned badge record.
 */
export function createEarnedBadge(badge, userId = '') {
  return {
    ...badge,
    userId,
    earnedAt: new Date().toISOString(),
  };
}

/**
 * Returns the rarity color CSS class for a badge.
 * @param {string} rarity - Rarity string.
 * @returns {string} CSS class name.
 */
export function getBadgeRarityClass(rarity) {
  const map = {
    common: 'badge--common',
    rare: 'badge--rare',
    epic: 'badge--epic',
    legendary: 'badge--legendary',
  };
  return map[rarity] || 'badge--common';
}

/** @type {Badge[]} Default badge catalog. */
export const BADGE_CATALOG = [
  createBadge({ id: 'first_login', name: 'First Steps', description: 'Logged in for the first time.', icon: '👋', category: 'milestone', rarity: 'common', criteria: { event: 'login' }, xpBonus: 10 }),
  createBadge({ id: 'first_lesson', name: 'Eager Learner', description: 'Completed your first lesson.', icon: '📖', category: 'milestone', rarity: 'common', criteria: { lessonsCompleted: 1 }, xpBonus: 25 }),
  createBadge({ id: 'first_course', name: 'Course Finisher', description: 'Completed your first course.', icon: '🎓', category: 'course', rarity: 'rare', criteria: { coursesCompleted: 1 }, xpBonus: 100 }),
  createBadge({ id: 'streak_7', name: 'Week Warrior', description: 'Maintained a 7-day streak.', icon: '🔥', category: 'streak', rarity: 'rare', criteria: { streak: 7 }, xpBonus: 75 }),
  createBadge({ id: 'streak_30', name: 'Monthly Grinder', description: 'Maintained a 30-day streak.', icon: '💪', category: 'streak', rarity: 'epic', criteria: { streak: 30 }, xpBonus: 300 }),
  createBadge({ id: 'xp_500', name: 'Recon Agent', description: 'Reached 500 XP.', icon: '🕵️', category: 'milestone', rarity: 'common', criteria: { xp: 500 }, xpBonus: 50 }),
  createBadge({ id: 'xp_5000', name: 'Exploit Dev', description: 'Reached 5000 XP.', icon: '💻', category: 'milestone', rarity: 'epic', criteria: { xp: 5000 }, xpBonus: 250 }),
  createBadge({ id: 'xp_25000', name: 'Zero Day Master', description: 'Reached 25,000 XP.', icon: '⚡', category: 'milestone', rarity: 'legendary', criteria: { xp: 25000 }, xpBonus: 1000 }),
];
