import coursesConfig from '../../../data/courses.json';

export interface CourseProgress {
  courseId: string;
  completedLessons: string[];
  lastActiveLessonId: string | null;
  completedAt: string | null;
}

export interface LearningProgress {
  activeCourseId: string | null;
  courses: { [courseId: string]: CourseProgress };
}

export interface ProgressCalculation {
  completedCount: number;
  totalCount: number;
  percentage: number;
}

const STORAGE_KEY = 'hp_learning_progress';

function loadLearningProgress(): LearningProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as LearningProgress) : { activeCourseId: null, courses: {} };
  } catch (err) {
    console.error('Failed to parse learning progress.', err);
    return { activeCourseId: null, courses: {} };
  }
}

function saveLearningProgress(progress: LearningProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (err) {
    console.error('Failed to save learning progress.', err);
  }
}

export const LearningEngine = {
  startCourse(courseId: string): void {
    const progress = loadLearningProgress();
    progress.activeCourseId = courseId;
    if (!progress.courses[courseId]) {
      progress.courses[courseId] = { courseId, completedLessons: [], lastActiveLessonId: null, completedAt: null };
    }
    saveLearningProgress(progress);
  },

  getActiveCourseId(): string | null {
    return loadLearningProgress().activeCourseId;
  },

  continueCourse(courseId: string): string | null {
    const progress = loadLearningProgress();
    const courseProg = progress.courses[courseId];
    if (courseProg && courseProg.lastActiveLessonId) {
      return courseProg.lastActiveLessonId;
    }
    const config = coursesConfig.find(c => c.id === courseId);
    if (config && config.sections.length > 0 && config.sections[0].lessons.length > 0) {
      return config.sections[0].lessons[0].id;
    }
    return null;
  },

  completeLesson(courseId: string, lessonId: string): { xpReward: number; courseCompleted: boolean } {
    const progress = loadLearningProgress();
    if (!progress.courses[courseId]) {
      progress.courses[courseId] = { courseId, completedLessons: [], lastActiveLessonId: null, completedAt: null };
    }

    const courseProg = progress.courses[courseId];
    courseProg.lastActiveLessonId = lessonId;

    const config = coursesConfig.find(c => c.id === courseId);
    if (!config) return { xpReward: 0, courseCompleted: false };

    let xpReward = 0;
    let totalLessonsCount = 0;
    
    for (const section of config.sections) {
      totalLessonsCount += section.lessons.length;
      const lesson = section.lessons.find(l => l.id === lessonId);
      if (lesson) xpReward = lesson.xp;
    }

    let isNewCompletion = false;
    if (!courseProg.completedLessons.includes(lessonId)) {
      courseProg.completedLessons.push(lessonId);
      isNewCompletion = true;
    }

    const courseCompleted = courseProg.completedLessons.length >= totalLessonsCount;
    if (courseCompleted && !courseProg.completedAt) {
      courseProg.completedAt = new Date().toISOString();
    }

    saveLearningProgress(progress);
    return {
      xpReward: isNewCompletion ? xpReward : 0,
      courseCompleted: courseCompleted && isNewCompletion,
    };
  },

  calculateCourseProgress(courseId: string): ProgressCalculation {
    const progress = loadLearningProgress();
    const courseProg = progress.courses[courseId];
    const config = coursesConfig.find(c => c.id === courseId);
    if (!config) return { completedCount: 0, totalCount: 0, percentage: 0 };

    let totalCount = 0;
    for (const section of config.sections) {
      totalCount += section.lessons.length;
    }

    const completedCount = courseProg ? courseProg.completedLessons.length : 0;
    const percentage = totalCount > 0 ? Math.min(100, Math.round((completedCount / totalCount) * 100)) : 0;
    return { completedCount, totalCount, percentage };
  },

  getNextLessonId(courseId: string, currentLessonId: string): string | null {
    const config = coursesConfig.find(c => c.id === courseId);
    if (!config) return null;

    const lessonIds: string[] = [];
    for (const section of config.sections) {
      for (const lesson of section.lessons) {
        lessonIds.push(lesson.id);
      }
    }

    const currentIndex = lessonIds.indexOf(currentLessonId);
    if (currentIndex !== -1 && currentIndex + 1 < lessonIds.length) {
      return lessonIds[currentIndex + 1];
    }
    return null;
  },

  /**
   * Returns a flat list of every lesson in a course, each tagged with its
   * parent sectionId. Used by PracticeEngine to avoid re-implementing
   * section traversal logic.
   */
  getAllLessons(courseId: string): Array<{
    id: string;
    title: string;
    duration: string;
    type: string;
    xp: number;
    sectionId: string;
  }> {
    const config = coursesConfig.find(c => c.id === courseId);
    if (!config) return [];
    const result: Array<{ id: string; title: string; duration: string; type: string; xp: number; sectionId: string }> = [];
    for (const section of config.sections) {
      for (const lesson of section.lessons) {
        result.push({ ...lesson, sectionId: section.id });
      }
    }
    return result;
  },
};

export default LearningEngine;
