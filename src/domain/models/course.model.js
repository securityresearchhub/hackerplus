/**
 * @fileoverview Course domain model factory.
 * Defines the shape and construction of course and lesson objects.
 */

/**
 * Creates a normalized course object from raw data.
 * @param {Object} raw - Raw course data.
 * @returns {Object} Normalized course object.
 */
export function createCourse(raw = {}) {
  return {
    id: raw.id || '',
    title: raw.title || '',
    description: raw.description || '',
    category: raw.category || 'general',
    difficulty: raw.difficulty || 'beginner',
    thumbnail: raw.thumbnail || '',
    author: raw.author || 'HackerPlus Team',
    xpReward: raw.xpReward || 0,
    estimatedTime: raw.estimatedTime || 0,
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    lessons: Array.isArray(raw.lessons) ? raw.lessons.map(createLesson) : [],
    prerequisites: Array.isArray(raw.prerequisites) ? raw.prerequisites : [],
    createdAt: raw.createdAt || new Date().toISOString(),
  };
}

/**
 * Creates a normalized lesson object from raw data.
 * @param {Object} raw - Raw lesson data.
 * @returns {Object} Normalized lesson object.
 */
export function createLesson(raw = {}) {
  return {
    id: raw.id || '',
    courseId: raw.courseId || '',
    title: raw.title || '',
    type: raw.type || 'text', // text | video | quiz | lab
    content: raw.content || '',
    xpReward: raw.xpReward || 0,
    duration: raw.duration || 0,
    order: raw.order || 0,
    isLocked: raw.isLocked ?? true,
  };
}

/**
 * Checks whether a course is considered complete (has required fields).
 * @param {Object} course - Course object.
 * @returns {boolean} True if valid.
 */
export function isValidCourse(course) {
  return (
    course &&
    typeof course.id === 'string' &&
    course.id.length > 0 &&
    typeof course.title === 'string' &&
    course.title.length > 0
  );
}

/**
 * Returns a lightweight catalog summary for list views.
 * @param {Object} course - Full course object.
 * @returns {Object} Catalog card data.
 */
export function toCatalogCard(course) {
  const { id, title, description, category, difficulty, thumbnail, xpReward, estimatedTime, tags } = course;
  const lessonCount = Array.isArray(course.lessons) ? course.lessons.length : 0;
  return { id, title, description, category, difficulty, thumbnail, xpReward, estimatedTime, tags, lessonCount };
}
