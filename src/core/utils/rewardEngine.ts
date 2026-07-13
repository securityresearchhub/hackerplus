/**
 * rewardEngine.ts
 * Centralized XP and Learning Credits reward manager.
 *
 * Owns the `hp_reward_history` localStorage key.
 * Enforces "no duplicate rewards" and prevents replay exploits.
 * Resolves level/rank recalculations and updates progress storage.
 */
import { XP_RULES } from '../../data/xpRules';
import { loadProgress, saveProgress, updateXp } from './progressEngine';
import { AchievementEngine } from './achievementEngine';
import initialHistory from '../../../data/reward-history.json';

export interface RewardHistoryEntry {
  id: string;
  type: 'login' | 'streak' | 'lab' | 'challenge' | 'quiz' | 'referral' | 'instructor';
  targetId: string;
  xp: number;
  credits: number;
  timestamp: string;
  description: string;
}

const HISTORY_KEY = 'hp_reward_history';

// ── Persistence ──────────────────────────────────────────────────────────────

function loadHistory(): RewardHistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as RewardHistoryEntry[]) : (initialHistory as RewardHistoryEntry[]);
  } catch {
    return initialHistory as RewardHistoryEntry[];
  }
}

function saveHistory(history: RewardHistoryEntry[]): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (err) {
    console.error('[RewardEngine] Failed to save reward history.', err);
  }
}

// ── Core Gating ──────────────────────────────────────────────────────────────

function hasBeenClaimed(type: string, targetId: string): boolean {
  const history = loadHistory();
  return history.some(entry => entry.type === type && entry.targetId === targetId);
}

// ── Reward Dispatcher ────────────────────────────────────────────────────────

function processReward(
  type: RewardHistoryEntry['type'],
  targetId: string,
  xp: number,
  credits: number,
  description: string
): void {
  // Enforce No Duplicate Rewards
  if (hasBeenClaimed(type, targetId)) {
    return;
  }

  // 1. Update history
  const history = loadHistory();
  const entry: RewardHistoryEntry = {
    id: `rew_${type}_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    type,
    targetId,
    xp,
    credits,
    timestamp: new Date().toISOString(),
    description,
  };
  saveHistory([...history, entry]);

  // 2. Update user progress (XP + Credits)
  const progress = loadProgress();
  progress.learningCredits = (progress.learningCredits || 0) + credits;
  saveProgress(progress);

  // updateXp handles XP increase, level/rank calculation, and saves state
  updateXp(progress, xp);

  // 3. Centralized automatic badge evaluation (HP-033)
  AchievementEngine.evaluateAchievements();
}

// ── RewardEngine ─────────────────────────────────────────────────────────────

export const RewardEngine = {
  getRewardHistory(): RewardHistoryEntry[] {
    return loadHistory();
  },

  getLearningCredits(): number {
    return loadProgress().learningCredits || 0;
  },

  hasRewardBeenClaimed(type: string, targetId: string): boolean {
    return hasBeenClaimed(type, targetId);
  },

  awardDailyLogin(username: string): void {
    const todayStr = new Date().toISOString().split('T')[0];
    const rule = XP_RULES.dailyLogin;
    processReward('login', todayStr, rule.xp, rule.credits, `${rule.description} for @${username}`);
  },

  awardStreakBonus(username: string, streak: number): void {
    const todayStr = new Date().toISOString().split('T')[0];
    // Avoid double streak awards for same milestone day
    const rule = XP_RULES.streakBonus;
    processReward('streak', `streak-${streak}-${todayStr}`, rule.xp, rule.credits, `${rule.description} (Day ${streak}) for @${username}`);
  },

  awardLabCompletion(labId: string, baseXp: number): void {
    // Determine credits dynamically (e.g. 15% of XP, minimum 10)
    const credits = Math.max(10, Math.round(baseXp * 0.15));
    processReward('lab', labId, baseXp, credits, `Completed Target Lab: ${labId}`);
  },

  awardChallengeCompletion(challengeId: string, baseXp: number): void {
    // Determine credits dynamically (e.g. 20% of XP, minimum 15)
    const credits = Math.max(15, Math.round(baseXp * 0.20));
    processReward('challenge', challengeId, baseXp, credits, `Captured Stage Flag: ${challengeId}`);
  },

  awardQuizPass(topicId: string): void {
    const rule = XP_RULES.quizPass;
    processReward('quiz', topicId, rule.xp, rule.credits, `${rule.description}: ${topicId}`);
  },

  claimReferral(referralCode: string): { success: boolean; message: string } {
    if (hasBeenClaimed('referral', referralCode)) {
      return { success: false, message: 'This referral code has already been activated.' };
    }
    const rule = XP_RULES.referral;
    processReward('referral', referralCode, rule.xp, rule.credits, `${rule.description} (${referralCode})`);
    return { success: true, message: `Successfully claimed referral! Earned +${rule.xp} XP and +${rule.credits} Learning Credits.` };
  },

  awardInstructorBonus(batchId: string, topicId: string): void {
    const rule = XP_RULES.instructorBonus;
    processReward('instructor', `${batchId}-${topicId}`, rule.xp, rule.credits, `${rule.description} inside ${batchId}`);
  },
};

export default RewardEngine;
