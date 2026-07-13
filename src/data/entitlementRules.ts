/**
 * entitlementRules.ts
 * Single source of truth for plan definitions and feature access rules.
 * Pure data — no logic, no imports, no side effects.
 *
 * To change what a plan unlocks, edit PLAN_RULES below.
 * No other file in the codebase defines premium access.
 */

// ── Plan types ───────────────────────────────────────────────────────────────

export type Plan =
  | 'community'
  | 'student_premium'
  | 'partner_premium'
  | 'enterprise';

export type Feature =
  | 'docker_labs'
  | 'ai_mentor'
  | 'reporting'
  | 'org_management'
  | 'advanced_challenges'
  | 'unlimited_labs'
  | 'unlimited_challenges';

// ── Plan rules ───────────────────────────────────────────────────────────────

export interface PlanRules {
  /** Human-readable name for UI display */
  displayName: string;
  /** Number of labs accessible (by index order), or 'all' */
  unlockedLabCount: number | 'all';
  /** Number of challenges accessible (by index order), or 'all' */
  unlockedChallengeCount: number | 'all';
  /** Set of feature flags enabled for this plan */
  features: Feature[];
  /** Monthly price in USD (0 = free). For display/metadata only — no billing logic. */
  priceUsd: number;
}

export const PLAN_RULES: Record<Plan, PlanRules> = {
  community: {
    displayName: 'Community',
    unlockedLabCount: 3,
    unlockedChallengeCount: 5,
    features: [],
    priceUsd: 0,
  },
  student_premium: {
    displayName: 'Student Premium',
    unlockedLabCount: 'all',
    unlockedChallengeCount: 'all',
    features: [
      'docker_labs',
      'advanced_challenges',
      'unlimited_labs',
      'unlimited_challenges',
    ],
    priceUsd: 15,
  },
  partner_premium: {
    displayName: 'Partner Premium',
    unlockedLabCount: 'all',
    unlockedChallengeCount: 'all',
    features: [
      'docker_labs',
      'advanced_challenges',
      'unlimited_labs',
      'unlimited_challenges',
    ],
    priceUsd: 0, // activated via partner code, not direct payment
  },
  enterprise: {
    displayName: 'Enterprise',
    unlockedLabCount: 'all',
    unlockedChallengeCount: 'all',
    features: [
      'docker_labs',
      'ai_mentor',
      'advanced_challenges',
      'unlimited_labs',
      'unlimited_challenges',
      'reporting',
      'org_management',
    ],
    priceUsd: 49,
  },
};

// ── Upgrade messaging ────────────────────────────────────────────────────────

export const UPGRADE_MESSAGES: Record<Feature, string> = {
  docker_labs: 'Upgrade to Premium to access Docker-powered live labs.',
  ai_mentor: 'AI Mentor is available on Enterprise plans.',
  reporting: 'Reporting dashboards are available on Enterprise plans.',
  org_management: 'Organization management requires an Enterprise plan.',
  advanced_challenges: 'Upgrade to Premium to unlock advanced challenges.',
  unlimited_labs: 'Upgrade to Premium for unlimited lab access.',
  unlimited_challenges: 'Upgrade to Premium for unlimited challenge access.',
};

export const DEFAULT_UPGRADE_MESSAGE =
  'Upgrade your plan to unlock this feature.';
