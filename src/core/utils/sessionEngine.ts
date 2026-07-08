import { loadCompleteSession, CompleteSession, saveSessionState } from './autoSaveEngine';
import { loadProgress, updateXp, completeCourse } from './progressEngine';
import { LearningEngine, ProgressCalculation } from './learningEngine';
import { ChallengeEngine, ChallengeInfo } from './challengeEngine';
import badgesConfig from '../../../data/badges.json';
import coursesConfig from '../../../data/courses.json';
import labsConfig from '../../../data/labs.json';

export interface BadgeInfo {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface UserProfile {
  username: string;
  displayName: string;
  bio: string;
  country: string;
  joinedDate: string;
  level: number;
  xp: number;
  nextLevelXp: number;
  xpPercent: number;
  streak: number;
  rank: string;
  completedCourses: number;
  completedLabs: number;
  completedChallenges: number;
  earnedBadges: BadgeInfo[];
}

export interface LabInfo {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  duration: string;
  xp: number;
  completed: boolean;
  featured: boolean;
  recommended: boolean;
  recent: boolean;
  inProgress: boolean;
}

export interface DashboardData {
  xp: number;
  level: number;
  rank: string;
  streak: number;
  completedLabsCount: number;
  completedChallengesCount: number;
  completedCoursesCount: number;
  progressPercentage: number;
  xpNeededForNextLevel: number;
}

export const SessionEngine = {
  /**
   * Retrieves the current active session state containing progress, settings, and XP progress.
   */
  getCurrentSession(): CompleteSession {
    return loadCompleteSession();
  },

  /**
   * Re-fetches the latest complete session from the persistence layer.
   */
  refreshSession(): CompleteSession {
    return loadCompleteSession();
  },

  /**
   * Extracts and returns the core user profile attributes.
   */
  getUserProfile(): UserProfile {
    const { progress, session, xpProgress } = loadCompleteSession();
    
    // Resolve earned badge metadata from config
    const earnedBadges: BadgeInfo[] = progress.earnedBadges.map(badgeId => {
      const match = (badgesConfig as any[]).find(b => b.id === badgeId);
      return {
        id: badgeId,
        name: match ? match.name : badgeId,
        icon: match ? match.icon : '🏅',
        description: match ? match.description : 'Special Achievement',
      };
    });

    const nextLevelXp = progress.xp + xpProgress.xpNeededForNextLevel;

    return {
      username: session.username,
      displayName: session.displayName,
      bio: session.bio,
      country: session.country,
      joinedDate: session.joinedDate,
      level: progress.level,
      xp: progress.xp,
      nextLevelXp,
      xpPercent: xpProgress.progressPercentage,
      streak: progress.streak,
      rank: progress.rank,
      completedCourses: progress.completedCourses.length,
      completedLabs: progress.completedLabs.length,
      completedChallenges: progress.completedChallenges.length,
      earnedBadges,
    };
  },

  /**
   * Updates user profile fields in session state storage.
   */
  updateUserProfile(updates: { displayName: string; bio: string; country: string }): void {
    saveSessionState(updates);
  },

  /**
   * Extracts and aggregates statistics specifically tailored for the Dashboard UI.
   */
  getDashboardData(): DashboardData {
    const { progress, xpProgress } = loadCompleteSession();
    return {
      xp: progress.xp,
      level: progress.level,
      rank: progress.rank,
      streak: progress.streak,
      completedLabsCount: progress.completedLabs.length,
      completedChallengesCount: progress.completedChallenges.length,
      completedCoursesCount: progress.completedCourses.length,
      progressPercentage: xpProgress.progressPercentage,
      xpNeededForNextLevel: xpProgress.xpNeededForNextLevel,
    };
  },

  /**
   * Starts a course by registering it in the learning engine.
   */
  startCourse(courseId: string): void {
    LearningEngine.startCourse(courseId);
    saveSessionState({
      currentChallengeId: null,
      currentLabId: null,
    });
  },

  /**
   * Resumes course progression by returning the next or last active lesson ID.
   */
  continueCourse(courseId: string): string | null {
    return LearningEngine.continueCourse(courseId);
  },

  /**
   * Returns course completion statistics.
   */
  getCourseProgress(courseId: string): ProgressCalculation {
    return LearningEngine.calculateCourseProgress(courseId);
  },

  /**
   * Completes a lesson, awards XP/completes the course if necessary, and returns results.
   */
  completeLesson(courseId: string, lessonId: string): { xpReward: number; courseCompleted: boolean; nextLessonId: string | null } {
    const { xpReward, courseCompleted } = LearningEngine.completeLesson(courseId, lessonId);
    
    let progress = loadProgress();
    
    // Award lesson XP if any
    if (xpReward > 0 && !courseCompleted) {
      progress = updateXp(progress, xpReward);
    }
    
    // If the course is completed, award the course-level XP reward and mark it completed
    if (courseCompleted) {
      const courseConfig = coursesConfig.find(c => c.id === courseId);
      const courseXpReward = courseConfig ? courseConfig.xpReward : 0;
      progress = completeCourse(progress, courseId, courseXpReward);
    }
    
    const nextLessonId = LearningEngine.getNextLessonId(courseId, lessonId);
    
    // Update active lesson in session state
    saveSessionState({
      currentLessonId: nextLessonId,
    });
    
    return {
      xpReward,
      courseCompleted,
      nextLessonId,
    };
  },

  /**
   * Returns the complete course configuration catalog.
   */
  getCourseCatalog() {
    return coursesConfig;
  },

  /**
   * Resolves the current active course ID.
   */
  getActiveCourseId(): string | null {
    return LearningEngine.getActiveCourseId();
  },

  /**
   * Returns the complete challenges configuration catalog.
   */
  getChallengesCatalog(): ChallengeInfo[] {
    return ChallengeEngine.getChallenges();
  },

  /**
   * Starts a challenge by setting it as active in the session state.
   */
  startChallenge(challengeId: string | null): void {
    ChallengeEngine.startChallenge(challengeId);
  },

  /**
   * Resets the completion status of a challenge and sets it as active.
   */
  replayChallenge(challengeId: string): void {
    ChallengeEngine.replayChallenge(challengeId);
  },

  /**
   * Returns the complete labs configuration catalog with dynamic completed and in-progress status.
   */
  getLabsCatalog(): LabInfo[] {
    const { progress, session } = loadCompleteSession();
    return (labsConfig as any[]).map(lab => ({
      ...lab,
      completed: progress.completedLabs.includes(lab.id),
      inProgress: session.currentLabId === lab.id,
    }));
  },

  /**
   * Resolves the current active lab ID.
   */
  getActiveLabId(): string | null {
    const { session } = loadCompleteSession();
    return session.currentLabId;
  },

  /**
   * Starts a lab by setting it as active in the session state.
   */
  startLab(labId: string): void {
    saveSessionState({
      currentLabId: labId,
    });
  }
};

export default SessionEngine;
