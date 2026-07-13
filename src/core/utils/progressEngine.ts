import defaultProgress from '../../../data/user-progress.json';
import levelConfig from '../../../data/levels.json';
import { calculateLevel, addXp } from './xpEngine';

export interface UserProgress {
  xp: number;
  level: number;
  rank: string;
  streak: number;
  learningCredits: number;
  completedLabs: string[];
  completedChallenges: string[];
  completedCourses: string[];
  earnedBadges: string[];
  lastLoginDate: string | null;
  totalTimeMinutes: number;
}

const STORAGE_KEY = 'hp_user_progress';

// Rank classifications mapping based on total XP
const RANK_THRESHOLDS = [
  { minXp: 25000, title: 'Zero Day Master' },
  { minXp: 15000, title: 'APT Operative' },
  { minXp: 8000, title: 'Red Teamer' },
  { minXp: 4000, title: 'Exploit Dev' },
  { minXp: 1500, title: 'Packet Sniffer' },
  { minXp: 500, title: 'Recon Agent' },
  { minXp: 0, title: 'Script Kiddie' },
];

/**
 * Dynamically resolves rank title based on total XP.
 */
function resolveRank(xp: number): string {
  const match = RANK_THRESHOLDS.find(threshold => xp >= threshold.minXp);
  return match ? match.title : 'Script Kiddie';
}

/**
 * Load user progress state. Fallback to default json.
 */
export function loadProgress(): UserProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { learningCredits: 0, ...defaultProgress } as UserProgress;
    const parsed = JSON.parse(raw);
    return {
      learningCredits: 0,
      ...parsed,
    } as UserProgress;
  } catch (err) {
    console.error('Failed to parse user progress storage. Resetting.', err);
    return { learningCredits: 0, ...defaultProgress } as UserProgress;
  }
}

/**
 * Save user progress persistently.
 */
export function saveProgress(progress: UserProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (err) {
    console.error('Failed to write user progress storage.', err);
  }
}

/**
 * Revert all progress.
 */
export function resetProgress(): UserProgress {
  const fresh = { ...defaultProgress } as UserProgress;
  saveProgress(fresh);
  return fresh;
}

/**
 * Add XP and recalculate level/rank.
 */
export function updateXp(progress: UserProgress, amount: number): UserProgress {
  const newXp = addXp(progress.xp, amount);
  const newLevel = calculateLevel(newXp, levelConfig);
  const newRank = resolveRank(newXp);

  const updated = {
    ...progress,
    xp: newXp,
    level: newLevel,
    rank: newRank,
  };
  saveProgress(updated);
  return updated;
}

/**
 * Update daily learning streak calendar records.
 */
export function updateStreak(progress: UserProgress): UserProgress {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  if (!progress.lastLoginDate) {
    const updated = { ...progress, streak: 1, lastLoginDate: todayStr };
    saveProgress(updated);
    return updated;
  }

  const lastLogin = new Date(progress.lastLoginDate);
  const diffTime = Math.abs(now.getTime() - lastLogin.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let newStreak = progress.streak;

  if (progress.lastLoginDate === todayStr) {
    // Already checked in today
    return progress;
  } else if (diffDays === 1) {
    // Consecutively logged in next day
    newStreak += 1;
  } else if (diffDays > 1) {
    // Missed a day, reset streak
    newStreak = 1;
  }

  const updated = {
    ...progress,
    streak: newStreak,
    lastLoginDate: todayStr,
  };
  saveProgress(updated);
  return updated;
}

/**
 * Award achievement badge.
 */
export function unlockBadge(progress: UserProgress, badgeId: string, xpReward = 0): UserProgress {
  if (progress.earnedBadges.includes(badgeId)) return progress;
  
  let updated = {
    ...progress,
    earnedBadges: [...progress.earnedBadges, badgeId],
  };

  if (xpReward > 0) {
    updated = updateXp(updated, xpReward);
  } else {
    saveProgress(updated);
  }
  
  return updated;
}

/**
 * Complete a Lab event wrapper.
 */
export function completeLab(progress: UserProgress, labId: string, _xpReward?: number): UserProgress {
  if (progress.completedLabs.includes(labId)) return progress;

  const updated = {
    ...progress,
    completedLabs: [...progress.completedLabs, labId],
  };

  saveProgress(updated);
  return updated;
}

/**
 * Complete a Challenge event wrapper.
 */
export function completeChallenge(progress: UserProgress, challengeId: string, _xpReward?: number): UserProgress {
  if (progress.completedChallenges.includes(challengeId)) return progress;

  const updated = {
    ...progress,
    completedChallenges: [...progress.completedChallenges, challengeId],
  };

  saveProgress(updated);
  return updated;
}

/**
 * Complete a Course event wrapper.
 */
export function completeCourse(progress: UserProgress, courseId: string, _xpReward?: number): UserProgress {
  if (progress.completedCourses.includes(courseId)) return progress;

  const updated = {
    ...progress,
    completedCourses: [...progress.completedCourses, courseId],
  };

  saveProgress(updated);
  return updated;
}
