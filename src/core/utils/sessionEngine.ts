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
import { EntitlementEngine } from './entitlementEngine';
import type { Plan, Feature, EntitlementState, UpgradePrompt, SetPlanOptions } from './entitlementEngine';
import { InstructorEngine } from './instructorEngine';
import type { UnlockedTopicInfo, TodayPractice } from './instructorEngine';
import type { BatchInfo } from './batchEngine';
import { RewardEngine } from './rewardEngine';
import type { RewardHistoryEntry } from './rewardEngine';
import { PermissionEngine } from './permissionEngine';
import type { RoleName } from '../../data/roles';
import type { Permission } from '../../data/permissions';
import badgesConfig from '../../../data/badges.json';
import coursesConfig from '../../../data/courses.json';
import labsConfig from '../../../data/labs.json';
import challengesConfig from '../../../data/challenges.json';

export type { ModuleInfo, LessonWithPractice, PracticeLabRef, PracticeChallengeRef, QuizQuestion };
export type { TrackInfo, TopicInfo, TopicProgress, RequiredItem, CompleteTopicResult };
export type { Plan, Feature, EntitlementState, UpgradePrompt, SetPlanOptions };
export type { UnlockedTopicInfo, TodayPractice, BatchInfo };
export type { RewardHistoryEntry };
export type { RoleName, Permission };

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
    this.triggerDailyLogin();
    return loadCompleteSession();
  },

  /**
   * Re-fetches the latest complete session from the persistence layer.
   */
  refreshSession(): CompleteSession {
    this.triggerDailyLogin();
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
    const badgesBefore = oldProgress.earnedBadges || [];

    let xpEarned = 0;

    if (!isAlreadyCompleted) {
      const challengeConfig = (challengesConfig as any[]).find(c => c.id === challengeId);
      xpEarned = challengeConfig ? challengeConfig.xp : 0;
      RewardEngine.awardChallengeCompletion(challengeId, xpEarned);
    }

    const updatedProgress = loadProgress();
    const badgesAfter = updatedProgress.earnedBadges || [];

    // Detect if any badge was unlocked during the challenge completion
    let unlockedBadge: BadgeInfo | null = null;
    const newlyUnlockedId = badgesAfter.find(id => !badgesBefore.includes(id));
    if (newlyUnlockedId) {
      const badgeConfig = (badgesConfig as any[]).find(b => b.id === newlyUnlockedId);
      if (badgeConfig) {
        unlockedBadge = {
          id: newlyUnlockedId,
          name: badgeConfig.name,
          icon: badgeConfig.icon,
          description: badgeConfig.description
        };
      }
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
        RewardEngine.awardLabCompletion(labId, xpReward);
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
    if (score >= 70) {
      RewardEngine.awardQuizPass(topicId);
    }
    this.notifyChange();
  },

  /**
   * Records that the challenge for a topic has been completed, then notifies.
   */
  markTopicChallengeComplete(topicId: string): void {
    TopicEngine.markChallengeComplete(topicId);
    this.notifyChange();
  },

  // ── Entitlement Engine (HP-029) ───────────────────────────────────

  /** Returns the user's current effective plan. */
  getUserPlan(): Plan {
    return EntitlementEngine.getCurrentPlan();
  },

  /** Returns full entitlement state (plan, partnerId, expiry). */
  getEntitlementState(): EntitlementState {
    return EntitlementEngine.getEntitlementState();
  },

  /** Can the user access this lab? Resolves allLabIds internally. */
  canAccessLab(labId: string): boolean {
    return EntitlementEngine.canAccessLab(labId, LabEngine.allLabIds());
  },

  /** Can the user access this challenge? Resolves allChallengeIds internally. */
  canAccessChallenge(challengeId: string): boolean {
    return EntitlementEngine.canAccessChallenge(challengeId, ChallengeEngine.allChallengeIds());
  },

  /** Does the current plan include the given feature? */
  hasFeature(feature: Feature): boolean {
    return EntitlementEngine.hasFeature(feature);
  },

  /** Returns structured upgrade prompt metadata for the UI. */
  getUpgradePrompt(feature: Feature | null): UpgradePrompt {
    return EntitlementEngine.getUpgradePrompt(feature);
  },

  /** Is the user on any premium plan? */
  isPremium(): boolean {
    return EntitlementEngine.isPremium();
  },

  /**
   * Sets the user's plan. Single entry point for all plan changes.
   * Future payment gateways, partner activation, admin overrides call this.
   */
  setUserPlan(plan: Plan, options?: SetPlanOptions): void {
    EntitlementEngine.setUserPlan(plan, options);
    this.notifyChange();
  },

  // ── Instructor Workflow Engine (HP-030) ───────────────────────────

  /** Unlocks a topic for a batch. */
  unlockTopic(batchId: string, topicId: string): void {
    InstructorEngine.unlockTopic(batchId, topicId);
    this.notifyChange();
  },

  /** Returns all topics unlocked for a batch. */
  getUnlockedTopics(batchId: string): UnlockedTopicInfo[] {
    return InstructorEngine.getUnlockedTopics(batchId);
  },

  /** Resolves the "today's practice" metadata for the batch. */
  getTodayPractice(batchId: string): TodayPractice {
    return InstructorEngine.getTodayPractice(batchId);
  },

  /** Returns all active batches. */
  getBatches(): BatchInfo[] {
    return InstructorEngine.getBatches();
  },

  // ── XP Economy Engine (HP-031) ────────────────────────────────────

  /** Returns full reward history. */
  getRewardHistory(): RewardHistoryEntry[] {
    return RewardEngine.getRewardHistory();
  },

  /** Returns current Learning Credits balance. */
  getLearningCredits(): number {
    return RewardEngine.getLearningCredits();
  },

  /** Claims referral code bonus. */
  claimReferral(code: string): { success: boolean; message: string } {
    const result = RewardEngine.claimReferral(code);
    this.notifyChange();
    return result;
  },

  /** Checks in and awards daily login bonus if not already claimed today. */
  triggerDailyLogin(): void {
    const { session } = loadCompleteSession();
    if (session && session.username) {
      RewardEngine.awardDailyLogin(session.username);
      
      const progress = loadProgress();
      if (progress.streak > 0 && progress.streak % 7 === 0) {
        RewardEngine.awardStreakBonus(session.username, progress.streak);
      }
      this.notifyChange();
    }
  },

  /** Triggers the instructor bonus for a batch topic. */
  triggerInstructorBonus(batchId: string, topicId: string): void {
    RewardEngine.awardInstructorBonus(batchId, topicId);
    this.notifyChange();
  },

  // ── Role & Permission Engine (HP-034) ─────────────────────────────

  /** Returns the active user's assigned role. */
  getCurrentRole(): RoleName {
    const { session } = loadCompleteSession();
    return PermissionEngine.getCurrentRole(session.username);
  },

  /** Verifies if the active user possesses a permission capability. */
  hasPermission(permission: Permission): boolean {
    const { session } = loadCompleteSession();
    return PermissionEngine.hasPermission(session.username, permission);
  },

  /** Assigns a system role to a user callsign. */
  assignRole(username: string, role: RoleName): void {
    PermissionEngine.assignRole(username, role);
    this.notifyChange();
  },

  /** Returns all permissions mapped to a role name. */
  getPermissions(role: RoleName): Permission[] {
    return PermissionEngine.getPermissions(role);
  },
};

export default SessionEngine;
