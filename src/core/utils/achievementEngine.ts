/**
 * achievementEngine.ts
 * Centralized badges unlock evaluator.
 *
 * Loops through all locked badge definitions, evaluates unlock conditions,
 * writes earned badges to UserProgress, and awards XP milestones.
 * Resolves storage without importing RewardEngine to prevent circular dependency.
 */
import { BADGE_DEFINITIONS, type Badge } from '../../data/badgeDefinitions';
import { AchievementRules } from '../../data/achievementRules';
import { loadProgress, saveProgress, updateXp } from './progressEngine';

export interface UnlockedBadgeNotification {
  badgeId: string;
  name: string;
  icon: string;
  description: string;
  xpReward: number;
}

interface RewardHistoryEntry {
  id: string;
  type: string;
  targetId: string;
  xp: number;
  credits: number;
  timestamp: string;
  description: string;
}

const HISTORY_KEY = 'hp_reward_history';

// ── Local Storage Helpers ───────────────────────────────────────────────────

function loadHistory(): RewardHistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as RewardHistoryEntry[]) : [];
  } catch {
    return [];
  }
}

function saveHistory(history: RewardHistoryEntry[]): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (err) {
    console.error('[AchievementEngine] Failed to save reward history.', err);
  }
}

// ── AchievementEngine ────────────────────────────────────────────────────────

export const AchievementEngine = {
  /**
   * Evaluates all locked badges. If unlocked, records them and awards XP/credits.
   * Returns a list of newly unlocked badge notifications.
   */
  evaluateAchievements(): UnlockedBadgeNotification[] {
    let progress = loadProgress();
    const history = loadHistory();
    const newlyUnlocked: UnlockedBadgeNotification[] = [];

    let stateChanged = false;

    for (const badge of BADGE_DEFINITIONS) {
      // Only evaluate if not already earned
      if (!progress.earnedBadges.includes(badge.id)) {
        if (AchievementRules.checkCondition(badge, progress)) {
          // Unlock badge
          progress.earnedBadges.push(badge.id);

          // Log milestone reward to history (prevents duplicate payouts)
          const creditsReward = Math.max(10, Math.round(badge.xpReward * 0.15));
          const entry: RewardHistoryEntry = {
            id: `rew_milestone_${Date.now()}_${badge.id}`,
            type: 'milestone',
            targetId: badge.id,
            xp: badge.xpReward,
            credits: creditsReward,
            timestamp: new Date().toISOString(),
            description: `Unlocked Achievement Badge: ${badge.name}`,
          };
          history.push(entry);

          // Add credits and save intermediate progress
          progress.learningCredits = (progress.learningCredits || 0) + creditsReward;
          saveProgress(progress);

          // updateXp applies XP, updates levels/ranks, and saves progress
          progress = updateXp(progress, badge.xpReward);

          newlyUnlocked.push({
            badgeId: badge.id,
            name: badge.name,
            icon: badge.icon,
            description: badge.description,
            xpReward: badge.xpReward,
          });

          stateChanged = true;
        }
      }
    }

    if (stateChanged) {
      saveHistory(history);
    }

    return newlyUnlocked;
  },
};

export default AchievementEngine;
