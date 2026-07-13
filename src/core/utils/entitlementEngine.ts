/**
 * entitlementEngine.ts
 * Single source of truth for feature access in HackerPlus.
 *
 * Owns the `hp_entitlement` localStorage key (isolated from progress/session).
 * Every access question in the platform flows through this engine.
 *
 * Future payment gateways, partner activation portals, and admin dashboards
 * all call setUserPlan() — the only write entry point.
 */
import {
  PLAN_RULES,
  UPGRADE_MESSAGES,
  DEFAULT_UPGRADE_MESSAGE,
} from '../../data/entitlementRules';
import type { Plan, Feature, PlanRules } from '../../data/entitlementRules';

export type { Plan, Feature, PlanRules } from '../../data/entitlementRules';

// ── Public interfaces ────────────────────────────────────────────────────────

export interface EntitlementState {
  plan: Plan;
  /** Training partner identifier (e.g. 'fruzentrix'). Null for direct users. */
  partnerId: string | null;
  /** ISO timestamp when the plan was activated */
  activatedAt: string | null;
  /** ISO timestamp when the plan expires (null = lifetime / no expiry) */
  expiresAt: string | null;
}

export interface UpgradePrompt {
  requiredPlan: Plan;
  requiredPlanDisplayName: string;
  message: string;
  feature: Feature | null;
}

export interface SetPlanOptions {
  partnerId?: string;
  expiresAt?: string;
}

// ── localStorage store ───────────────────────────────────────────────────────

const STORAGE_KEY = 'hp_entitlement';

const DEFAULT_STATE: EntitlementState = {
  plan: 'community',
  partnerId: null,
  activatedAt: null,
  expiresAt: null,
};

function loadState(): EntitlementState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STATE };
    return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

function saveState(state: EntitlementState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('[EntitlementEngine] Failed to save entitlement state.', err);
  }
}

// ── Internal helpers ─────────────────────────────────────────────────────────

/** Returns the effective plan, falling back to community if expired. */
function getEffectivePlan(): Plan {
  const state = loadState();
  if (state.expiresAt) {
    const now = new Date();
    const exp = new Date(state.expiresAt);
    if (now > exp) return 'community';
  }
  return state.plan;
}

function getRules(): PlanRules {
  return PLAN_RULES[getEffectivePlan()];
}

// ── EntitlementEngine ────────────────────────────────────────────────────────

export const EntitlementEngine = {
  // ── Reads ─────────────────────────────────────────────────────────────────

  /** Returns the user's current effective plan (expired → community). */
  getCurrentPlan(): Plan {
    return getEffectivePlan();
  },

  /** Returns full entitlement state including partner and expiry metadata. */
  getEntitlementState(): EntitlementState {
    return loadState();
  },

  /**
   * Can the user access a specific lab?
   * @param labId  The lab to check
   * @param allLabIds  Ordered list of all lab IDs (from labs.json)
   */
  canAccessLab(labId: string, allLabIds: string[]): boolean {
    const rules = getRules();
    if (rules.unlockedLabCount === 'all') return true;
    const idx = allLabIds.indexOf(labId);
    if (idx === -1) return false;
    return idx < rules.unlockedLabCount;
  },

  /**
   * Can the user access a specific challenge?
   * @param challengeId  The challenge to check
   * @param allChallengeIds  Ordered list of all challenge IDs (from challenges.json)
   */
  canAccessChallenge(challengeId: string, allChallengeIds: string[]): boolean {
    const rules = getRules();
    if (rules.unlockedChallengeCount === 'all') return true;
    const idx = allChallengeIds.indexOf(challengeId);
    if (idx === -1) return false;
    return idx < rules.unlockedChallengeCount;
  },

  /** Does the current plan include the given feature? */
  hasFeature(feature: Feature): boolean {
    return getRules().features.includes(feature);
  },

  /** Is the user on any premium plan (not community)? */
  isPremium(): boolean {
    return getEffectivePlan() !== 'community';
  },

  /**
   * Returns structured upgrade metadata for the UI.
   * If feature is null, returns a generic upgrade prompt.
   */
  getUpgradePrompt(feature: Feature | null): UpgradePrompt {
    const currentPlan = getEffectivePlan();

    // Find the cheapest plan that includes this feature
    let targetPlan: Plan = 'student_premium';
    if (feature) {
      if (PLAN_RULES.student_premium.features.includes(feature)) {
        targetPlan = 'student_premium';
      } else if (PLAN_RULES.enterprise.features.includes(feature)) {
        targetPlan = 'enterprise';
      }
    }

    const message = feature
      ? (UPGRADE_MESSAGES[feature] ?? DEFAULT_UPGRADE_MESSAGE)
      : DEFAULT_UPGRADE_MESSAGE;

    return {
      requiredPlan: targetPlan,
      requiredPlanDisplayName: PLAN_RULES[targetPlan].displayName,
      message,
      feature,
    };
  },

  /** Returns the display name of the current plan. */
  getPlanDisplayName(): string {
    return PLAN_RULES[getEffectivePlan()].displayName;
  },

  // ── Write (single entry point for all plan changes) ────────────────────

  /**
   * Sets the user's plan. This is the ONLY method that changes entitlements.
   * Future payment gateways, partner activation, admin overrides all call this.
   */
  setUserPlan(plan: Plan, options?: SetPlanOptions): void {
    const state: EntitlementState = {
      plan,
      partnerId: options?.partnerId ?? null,
      activatedAt: new Date().toISOString(),
      expiresAt: options?.expiresAt ?? null,
    };
    saveState(state);
  },

  /** Resets to free community plan. Used on logout or for testing. */
  resetToFree(): void {
    saveState({ ...DEFAULT_STATE });
  },
};

export default EntitlementEngine;
