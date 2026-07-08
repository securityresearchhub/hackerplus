/**
 * @fileoverview Progress domain model factory.
 * Defines progress record shapes and construction helpers.
 */

/**
 * Creates a normalized user progress record.
 * @param {Object} raw - Raw progress data.
 * @returns {Object} Normalized progress object.
 */
export function createProgress(raw = {}) {
  return {
    userId: raw.userId || '',
    xp: raw.xp || 0,
    level: raw.level || 1,
    rank: raw.rank || 'Script Kiddie',
    streak: raw.streak || 0,
    lastLoginDate: raw.lastLoginDate || null,
    completedLessons: raw.completedLessons || {},
    completedCourses: Array.isArray(raw.completedCourses) ? raw.completedCourses : [],
    totalTimeSpent: raw.totalTimeSpent || 0,
    badges: Array.isArray(raw.badges) ? raw.badges : [],
  };
}

/**
 * Creates a lesson-completion record.
 * @param {string} courseId - Course identifier.
 * @param {string} lessonId - Lesson identifier.
 * @param {number} [xpEarned=0] - XP earned for this lesson.
 * @returns {Object} Lesson completion record.
 */
export function createLessonCompletion(courseId, lessonId, xpEarned = 0) {
  return {
    courseId,
    lessonId,
    xpEarned,
    completedAt: new Date().toISOString(),
  };
}

/**
 * Checks if a specific lesson has been completed.
 * @param {Object} progress - User progress object.
 * @param {string} courseId - Course ID.
 * @param {string} lessonId - Lesson ID.
 * @returns {boolean} True if lesson is completed.
 */
export function isLessonCompleted(progress, courseId, lessonId) {
  const courseLessons = progress.completedLessons[courseId];
  if (!courseLessons) return false;
  return Array.isArray(courseLessons)
    ? courseLessons.includes(lessonId)
    : courseLessons instanceof Set
    ? courseLessons.has(lessonId)
    : false;
}

/**
 * Returns the completion percentage for a course.
 * @param {Object} progress - User progress.
 * @param {string} courseId - Course ID.
 * @param {number} totalLessons - Total number of lessons in the course.
 * @returns {number} Percentage 0–100.
 */
export function getCourseCompletionPercent(progress, courseId, totalLessons) {
  if (!totalLessons) return 0;
  const completed = progress.completedLessons[courseId];
  const count = Array.isArray(completed) ? completed.length : 0;
  return Math.round((count / totalLessons) * 100);
}
