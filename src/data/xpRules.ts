/**
 * xpRules.ts
 * Centralized static configuration defining XP and Credits rewards
 * for all platform activities.
 *
 * UI must never hardcode or calculate reward values.
 */

export interface RewardConfig {
  xp: number;
  credits: number;
  description: string;
}

export const XP_RULES = {
  dailyLogin: {
    xp: 50,
    credits: 10,
    description: 'Daily portal check-in',
  },
  streakBonus: {
    xp: 200,
    credits: 50,
    description: '7-day consecutive streak milestone',
  },
  quizPass: {
    xp: 100,
    credits: 25,
    description: 'Topic assessment passed',
  },
  referral: {
    xp: 500,
    credits: 100,
    description: 'Referral code activation',
  },
  instructorBonus: {
    xp: 150,
    credits: 30,
    description: 'Instructor live training bonus',
  },
};
