import { loadCompleteSession, CompleteSession, saveSessionState } from './autoSaveEngine';
import badgesConfig from '../../../data/badges.json';

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
  }
};

export default SessionEngine;
