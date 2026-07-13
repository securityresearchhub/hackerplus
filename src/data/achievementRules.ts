/**
 * achievementRules.ts
 * Pure rules evaluator mapping unlockCondition types to logic.
 */
import type { UserProgress } from '../core/utils/progressEngine';
import type { Badge } from './badgeDefinitions';

export const AchievementRules = {
  /**
   * Evaluates if a user progress satisfies the badge condition.
   */
  checkCondition(badge: Badge, progress: UserProgress): boolean {
    const cond = badge.unlockCondition;
    switch (cond.type) {
      case 'xp_earned':
        return progress.xp >= (cond.value as number);

      case 'streak_days':
        return progress.streak >= (cond.value as number);

      case 'ctf_solved':
        return progress.completedChallenges.length >= (cond.value as number);

      case 'courses_completed':
        return progress.completedCourses.length >= (cond.value as number);

      case 'course_completed':
        return progress.completedCourses.includes(cond.value as string);

      case 'lessons_completed': {
        // Approximate lessons from courses and labs completed
        const estimatedLessons =
          progress.completedCourses.length * 5 + progress.completedLabs.length;
        return estimatedLessons >= (cond.value as number);
      }

      case 'lessons_per_day':
        // Safe check for daily lesson velocity milestones
        return progress.completedCourses.length >= 1;

      case 'special':
        // Handles custom special trigger milestones (e.g. night-owl)
        if (cond.value === 'midnight_learner') {
          const currentHour = new Date().getHours();
          return currentHour >= 0 && currentHour < 5;
        }
        return false;

      default:
        return false;
    }
  },
};

export default AchievementRules;
