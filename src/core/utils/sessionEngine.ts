import { loadCompleteSession, CompleteSession, saveSessionState, restoreSessionState } from './autoSaveEngine';
import { loadProgress, updateXp, completeCourse, completeChallenge, saveProgress, completeLab } from './progressEngine';
import { LearningEngine, ProgressCalculation } from './learningEngine';
import { ChallengeEngine, ChallengeInfo } from './challengeEngine';
import { FlagEngine } from './flagEngine';
import { LabEngine } from './labEngine';
import { AuthService } from '../../services/authService';
import type { LabSessionStatus } from './labSessionService';
import { PracticeEngine } from './practiceEngine';
import type { ModuleInfo, LessonWithPractice, PracticeLabRef, PracticeChallengeRef, QuizQuestion } from './practiceEngine';
import { TopicEngine } from './topicEngine';
import type { TrackInfo, TopicInfo, TopicProgress, RequiredItem, CompleteTopicResult } from './topicEngine';
import badgesConfig from '../../../data/badges.json';
import coursesConfig from '../../../data/courses.json';
import labsConfig from '../../../data/labs.json';
import challengesConfig from '../../../data/challenges.json';

export type { ModuleInfo, LessonWithPractice, PracticeLabRef, PracticeChallengeRef, QuizQuestion };
export type { TrackInfo, TopicInfo, TopicProgress, RequiredItem, CompleteTopicResult };

export interface AuthResponse {
  success: boolean;
  error?: string;
}

type SessionListener = () => void;
const sessionListeners = new Set<SessionListener>();

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
  locked: boolean;
  targetIp?: string;
  targetUrl?: string;
}

export interface MissionCompleteDetails {
  success: boolean;
  message: string;
  xpEarned: number;
  prevLevel: number;
  currentLevel: number;
  currentRank: string;
  prevXpPercent: number;
  currentXpPercent: number;
  unlockedBadge: BadgeInfo | null;
  unlockedChallenge: { id: string; title: string } | null;
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
  subscribe(listener: SessionListener): () => void {
    sessionListeners.add(listener);
    return () => {
      sessionListeners.delete(listener);
    };
  },

  notifyChange(): void {
    sessionListeners.forEach(l => {
      try { l(); } catch (e) { console.error('SessionEngine observer notify error:', e); }
    });
  },

  /**
   * Returns true if the current session has an authenticated user.
   * This is the single source of truth for auth state. UI must never decide auth.
   */
  isAuthenticated(): boolean {
    return restoreSessionState().isAuthenticated === true;
  },

  /**
   * Validates credentials via AuthService and, on success, writes the real
   * user identity into SessionState before marking the session as authenticated.
   */
  login(email: string, password: string): AuthResponse {
    const result = AuthService.login(email, password);
    if (!result.success || !result.user) {
      return { success: false, error: result.error };
    }
    saveSessionState({
      isAuthenticated: true,
      username: result.user.username,
      displayName: result.user.displayName,
      joinedDate: result.user.joinedDate,
    });
    this.notifyChange();
    return { success: true };
  },

  /**
   * Registers a new user via AuthService and immediately logs them in on success.
   */
  register(username: string, email: string, password: string): AuthResponse {
    const result = AuthService.register(username, email, password);
    if (!result.success || !result.user) {
      return { success: false, error: result.error };
    }
    saveSessionState({
      isAuthenticated: true,
      username: result.user.username,
      displayName: result.user.displayName,
      joinedDate: result.user.joinedDate,
    });
    this.notifyChange();
    return { success: true };
  },

  /**
   * Clears authentication state and all user identity fields from the session.
   */
  logout(): void {
    saveSessionState({
      isAuthenticated: false,
      username: '',
      displayName: '',
    });
    this.notifyChange();
  },

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
    this.notifyChange();
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
    this.notifyChange();
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

    this.notifyChange();

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
    this.notifyChange();
  },

  /**
   * Resets the completion status of a challenge and sets it as active.
   */
  replayChallenge(challengeId: string): void {
    ChallengeEngine.replayChallenge(challengeId);
    this.notifyChange();
  },

  /**
   * Submits a flag for verification. Coordinates state updates and XP allocation if verified.
   */
  submitFlag(challengeId: string, flag: string): MissionCompleteDetails {
    const validation = FlagEngine.validateFlag(challengeId, flag);

    if (!validation.success) {
      return {
        success: false,
        message: validation.message,
        xpEarned: 0,
        prevLevel: 0,
        currentLevel: 0,
        currentRank: '',
        prevXpPercent: 0,
        currentXpPercent: 0,
        unlockedBadge: null,
        unlockedChallenge: null
      };
    }

    const { progress: oldProgress, xpProgress: oldXpProgress } = loadCompleteSession();
    const isAlreadyCompleted = oldProgress.completedChallenges.includes(challengeId);

    let xpEarned = 0;
    let updatedProgress = { ...oldProgress };

    if (!isAlreadyCompleted) {
      const challengeConfig = (challengesConfig as any[]).find(c => c.id === challengeId);
      xpEarned = challengeConfig ? challengeConfig.xp : 0;
      updatedProgress = completeChallenge(oldProgress, challengeId, xpEarned);
    }

    // Check for badge unlocks
    const solvedCount = isAlreadyCompleted
      ? updatedProgress.completedChallenges.length
      : updatedProgress.completedChallenges.length; // completeChallenge already pushed challengeId

    let unlockedBadge: BadgeInfo | null = null;

    const checkBadgeUnlock = (badgeId: string, conditionMet: boolean) => {
      if (conditionMet && !updatedProgress.earnedBadges.includes(badgeId)) {
        const badgeConfig = (badgesConfig as any[]).find(b => b.id === badgeId);
        if (badgeConfig) {
          updatedProgress.earnedBadges.push(badgeId);
          // Award badge XP reward
          const badgeXp = badgeConfig.xpReward || 0;
          xpEarned += badgeXp;
          updatedProgress = updateXp(updatedProgress, badgeXp);
          unlockedBadge = {
            id: badgeId,
            name: badgeConfig.name,
            icon: badgeConfig.icon,
            description: badgeConfig.description
          };
        }
      }
    };

    if (!isAlreadyCompleted) {
      checkBadgeUnlock('b007', solvedCount >= 1);
      checkBadgeUnlock('b008', solvedCount >= 10);
      checkBadgeUnlock('b009', solvedCount >= 50);
      saveProgress(updatedProgress);
    }

    // Reset active challenge
    ChallengeEngine.completeChallenge(challengeId);

    this.notifyChange();

    // Refresh complete session to get final level, rank, percentages
    const { progress: newProgress, xpProgress: newXpProgress } = loadCompleteSession();

    // Check for newly unlocked challenges
    let unlockedChallenge: { id: string; title: string } | null = null;
    if (!isAlreadyCompleted) {
      if (challengeId === 'ch4') {
        unlockedChallenge = { id: 'ch5', title: 'Golden Ticket Kerberos Attack' };
      } else if (challengeId === 'ch7') {
        unlockedChallenge = { id: 'ch8', title: 'Docker Socket Daemon Escape' };
      }
    }

    return {
      success: true,
      message: validation.message,
      xpEarned,
      prevLevel: oldProgress.level,
      currentLevel: newProgress.level,
      currentRank: newProgress.rank,
      prevXpPercent: oldXpProgress.progressPercentage,
      currentXpPercent: newXpProgress.progressPercentage,
      unlockedBadge,
      unlockedChallenge
    };
  },

  /**
   * Returns the complete labs configuration catalog with dynamic completed and in-progress status.
   */
  getLabsCatalog(): LabInfo[] {
    return LabEngine.getLabs() as LabInfo[];
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
    this.notifyChange();
  },

  /**
   * Initializes a target lab container via the Lab Session API.
   * Accepts an optional status callback so the caller can update provisioning UI in real time.
   */
  async initializeLab(labId: string, onStatusUpdate?: (status: LabSessionStatus) => void): Promise<void> {
    await LabEngine.initializeLab(labId, onStatusUpdate);
    this.notifyChange();
  },

  /**
   * Terminates the active target lab container.
   */
  async terminateLab(labId: string): Promise<void> {
    await LabEngine.terminateLab(labId);
    this.notifyChange();
  },

  /**
   * Submits a lab flag for verification. Coordinates state updates and XP allocation if verified.
   */
  submitLabFlag(labId: string, flag: string): { success: boolean; message: string } {
    const validation = FlagEngine.validateLabFlag(labId, flag);

    if (validation.success) {
      const progress = loadProgress();
      const isAlreadyCompleted = progress.completedLabs.includes(labId);

      if (!isAlreadyCompleted) {
        const labConfig = labsConfig.find(l => l.id === labId);
        const xpReward = labConfig ? labConfig.xp : 0;
        const updatedProgress = completeLab(progress, labId, xpReward);
        saveProgress(updatedProgress);
      }

      // Terminate container and clear active session
      LabEngine.terminateLab(labId);
      this.notifyChange();
    }

    return validation;
  },

  // ── Course Practice Engine ────────────────────────────────────────────────

  /**
   * Returns the modules (sections) for a course.
   * Each module includes lesson count for progress display.
   */
  getModules(courseId: string): ModuleInfo[] {
    return PracticeEngine.getModules(courseId);
  },

  /**
   * Returns fully enriched lessons for a module.
   * Each lesson includes practiceLabs, challenges, and quiz questions.
   */
  getLessons(moduleId: string, courseId: string): LessonWithPractice[] {
    return PracticeEngine.getLessons(moduleId, courseId);
  },

  /**
   * Returns the practice labs linked to a specific lesson.
   */
  getPracticeLabs(lessonId: string): PracticeLabRef[] {
    return PracticeEngine.getPracticeLabs(lessonId);
  },

  /**
   * Returns the challenges linked to a specific lesson.
   */
  getChallenges(lessonId: string): PracticeChallengeRef[] {
    return PracticeEngine.getChallenges(lessonId);
  },

  /**
   * Returns the next lesson after the given lesson, fully enriched.
   * Returns null when at the last lesson of the course.
   */
  getNextLesson(currentLessonId: string, courseId: string): LessonWithPractice | null {
    return PracticeEngine.getNextLesson(currentLessonId, courseId);
  },

  /**
   * Returns the quiz questions for a specific lesson.
   */
  getQuiz(lessonId: string): QuizQuestion[] {
    return PracticeEngine.getQuiz(lessonId);
  },

  // ── Topic Practice Engine (HP-028) ─────────────────────────────────

  /**
   * Returns all tracks with live completion counts.
   */
  getTracks(): TrackInfo[] {
    return TopicEngine.getTracks();
  },

  /**
   * Returns fully enriched topics for a track (locked state, labs, quiz, challenges).
   */
  getTopics(trackId: string): TopicInfo[] {
    return TopicEngine.getTopics(trackId);
  },

  /**
   * Returns a single enriched topic by ID, or null.
   */
  getTopicById(topicId: string): TopicInfo | null {
    return TopicEngine.getTopicById(topicId);
  },

  /**
   * Marks a topic complete, awards XP, notifies all subscribers.
   */
  completeTopic(topicId: string): CompleteTopicResult {
    const result = TopicEngine.completeTopic(topicId);
    this.notifyChange();
    return result;
  },

  /**
   * Returns the next topic in the same track after the given topic.
   */
  getNextTopic(topicId: string): TopicInfo | null {
    return TopicEngine.getNextTopic(topicId);
  },

  /**
   * Returns completion stats for a track.
   */
  getTrackProgress(trackId: string): { completed: number; total: number; percentage: number } {
    return TopicEngine.getTrackProgress(trackId);
  },

  /**
   * Records that the lab for a topic has been completed, then notifies.
   */
  markTopicLabComplete(topicId: string): void {
    TopicEngine.markLabComplete(topicId);
    this.notifyChange();
  },

  /**
   * Records a quiz score for a topic (pass threshold: 70%), then notifies.
   */
  recordTopicQuizResult(topicId: string, score: number): void {
    TopicEngine.recordQuizResult(topicId, score);
    this.notifyChange();
  },

  /**
   * Records that the challenge for a topic has been completed, then notifies.
   */
  markTopicChallengeComplete(topicId: string): void {
    TopicEngine.markChallengeComplete(topicId);
    this.notifyChange();
  },
};

export default SessionEngine;
