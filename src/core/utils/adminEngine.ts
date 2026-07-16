/**
 * adminEngine.ts
 * Centralized admin platform business logic for HP-035.
 *
 * All operations are RBAC-guarded via PermissionEngine.
 * AdminAuditEngine records every mutation.
 * SessionEngine is the only public-facing caller — UI never calls this directly.
 */
import { PermissionEngine } from './permissionEngine';
import { AdminAuditEngine } from './adminAuditEngine';
import { EntitlementEngine } from './entitlementEngine';
import { loadProgress, saveProgress } from './progressEngine';
import type { AdminPermission } from '../../data/adminPermissions';
import type { Plan } from '../../data/entitlementRules';
import type { RoleName } from '../../data/roles';

// ── Internal guard ────────────────────────────────────────────────────────────

function requirePermission(actor: string, permission: AdminPermission): void {
  if (!PermissionEngine.hasPermission(actor, permission)) {
    AdminAuditEngine.log(actor, permission, 'self', 'denied', 'Insufficient permissions');
    throw new Error(`[AdminEngine] Permission denied: ${permission}`);
  }
}

// ── Shared storage keys (read-only by admin — mutations go via own engines) ──

const USER_OVERRIDES_KEY  = 'hp_admin_user_overrides';
const COURSE_FLAGS_KEY    = 'hp_admin_course_flags';
const LAB_FLAGS_KEY       = 'hp_admin_lab_flags';
const CHALLENGE_FLAGS_KEY = 'hp_admin_challenge_flags';
const BATCH_STORE_KEY     = 'hp_batches';

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch { return fallback; }
}

function writeJson<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AdminUserRecord {
  username: string;
  role: RoleName;
  plan: Plan;
  suspended: boolean;
  xp: number;
  level: number;
  completedLabs: number;
  completedChallenges: number;
  completedCourses: number;
}

export interface AdminContentFlag {
  id: string;
  enabled: boolean;
  updatedAt: string;
  updatedBy: string;
}

export interface AdminBatchSummary {
  batchId: string;
  instructorId: string;
  studentCount: number;
  archived: boolean;
}

export interface AdminAnalytics {
  totalUsers: number;
  suspendedUsers: number;
  premiumUsers: number;
  totalXpAwarded: number;
  totalLabsCompleted: number;
  totalChallengesCompleted: number;
  enabledLabs: number;
  enabledChallenges: number;
  enabledCourses: number;
  activeBatches: number;
}

// ── AdminEngine ───────────────────────────────────────────────────────────────

export const AdminEngine = {

  // ── User Management ────────────────────────────────────────────────────────

  listUsers(actor: string): AdminUserRecord[] {
    requirePermission(actor, 'admin:manage_users');
    const overrides = readJson<Record<string, { suspended?: boolean }>>(USER_OVERRIDES_KEY, {});
    const roles = readJson<Record<string, RoleName>>('hp_user_roles', {});
    const progress = loadProgress();
    // Active session user is the only user in localStorage single-user model.
    const session = readJson<{ username?: string }>('hp_session', {});
    const username = session.username ?? 'unknown';
    const record: AdminUserRecord = {
      username,
      role: roles[username] ?? 'Student',
      plan: EntitlementEngine.getCurrentPlan(),
      suspended: overrides[username]?.suspended ?? false,
      xp: progress.xp,
      level: progress.level,
      completedLabs: progress.completedLabs.length,
      completedChallenges: progress.completedChallenges.length,
      completedCourses: progress.completedCourses.length,
    };
    AdminAuditEngine.log(actor, 'list_users', 'all', 'success');
    return [record];
  },

  suspendUser(actor: string, username: string): void {
    requirePermission(actor, 'admin:manage_users');
    const overrides = readJson<Record<string, { suspended?: boolean }>>(USER_OVERRIDES_KEY, {});
    overrides[username] = { ...overrides[username], suspended: true };
    writeJson(USER_OVERRIDES_KEY, overrides);
    AdminAuditEngine.log(actor, 'suspend_user', username, 'success');
  },

  unsuspendUser(actor: string, username: string): void {
    requirePermission(actor, 'admin:manage_users');
    const overrides = readJson<Record<string, { suspended?: boolean }>>(USER_OVERRIDES_KEY, {});
    overrides[username] = { ...overrides[username], suspended: false };
    writeJson(USER_OVERRIDES_KEY, overrides);
    AdminAuditEngine.log(actor, 'unsuspend_user', username, 'success');
  },

  assignUserRole(actor: string, username: string, role: RoleName): void {
    requirePermission(actor, 'admin:manage_users');
    PermissionEngine.assignRole(username, role);
    AdminAuditEngine.log(actor, 'assign_role', username, 'success', role);
  },

  resetUserProgress(actor: string, username: string): void {
    requirePermission(actor, 'admin:manage_users');
    const fresh = loadProgress();
    fresh.xp = 0; fresh.level = 1; fresh.streak = 0;
    fresh.completedLabs = []; fresh.completedChallenges = []; fresh.completedCourses = [];
    fresh.earnedBadges = []; fresh.learningCredits = 0;
    saveProgress(fresh);
    AdminAuditEngine.log(actor, 'reset_user_progress', username, 'success');
  },

  // ── Premium Management ─────────────────────────────────────────────────────

  overridePlan(actor: string, username: string, plan: Plan, expiresAt?: string): void {
    requirePermission(actor, 'admin:manage_premium');
    EntitlementEngine.setUserPlan(plan, { expiresAt });
    AdminAuditEngine.log(actor, 'override_plan', username, 'success', plan);
  },

  revokePremium(actor: string, username: string): void {
    requirePermission(actor, 'admin:manage_premium');
    EntitlementEngine.resetToFree();
    AdminAuditEngine.log(actor, 'revoke_premium', username, 'success');
  },

  // ── Course Management ──────────────────────────────────────────────────────

  setCourseEnabled(actor: string, courseId: string, enabled: boolean): void {
    requirePermission(actor, 'admin:manage_courses');
    const flags = readJson<Record<string, AdminContentFlag>>(COURSE_FLAGS_KEY, {});
    flags[courseId] = { id: courseId, enabled, updatedAt: new Date().toISOString(), updatedBy: actor };
    writeJson(COURSE_FLAGS_KEY, flags);
    AdminAuditEngine.log(actor, enabled ? 'enable_course' : 'disable_course', courseId, 'success');
  },

  listCourseFlags(actor: string): AdminContentFlag[] {
    requirePermission(actor, 'admin:manage_courses');
    return Object.values(readJson<Record<string, AdminContentFlag>>(COURSE_FLAGS_KEY, {}));
  },

  // ── Batch Management ───────────────────────────────────────────────────────

  listBatches(actor: string): AdminBatchSummary[] {
    requirePermission(actor, 'admin:manage_batches');
    const raw = readJson<Record<string, AdminBatchSummary>>(BATCH_STORE_KEY, {});
    AdminAuditEngine.log(actor, 'list_batches', 'all', 'success');
    return Object.values(raw);
  },

  archiveBatch(actor: string, batchId: string): void {
    requirePermission(actor, 'admin:manage_batches');
    const raw = readJson<Record<string, AdminBatchSummary>>(BATCH_STORE_KEY, {});
    if (raw[batchId]) {
      raw[batchId].archived = true;
      writeJson(BATCH_STORE_KEY, raw);
      AdminAuditEngine.log(actor, 'archive_batch', batchId, 'success');
    }
  },

  // ── Lab Management ─────────────────────────────────────────────────────────

  setLabEnabled(actor: string, labId: string, enabled: boolean): void {
    requirePermission(actor, 'admin:manage_labs');
    const flags = readJson<Record<string, AdminContentFlag>>(LAB_FLAGS_KEY, {});
    flags[labId] = { id: labId, enabled, updatedAt: new Date().toISOString(), updatedBy: actor };
    writeJson(LAB_FLAGS_KEY, flags);
    AdminAuditEngine.log(actor, enabled ? 'enable_lab' : 'disable_lab', labId, 'success');
  },

  listLabFlags(actor: string): AdminContentFlag[] {
    requirePermission(actor, 'admin:manage_labs');
    return Object.values(readJson<Record<string, AdminContentFlag>>(LAB_FLAGS_KEY, {}));
  },

  // ── Challenge Management ───────────────────────────────────────────────────

  setChallengeEnabled(actor: string, challengeId: string, enabled: boolean): void {
    requirePermission(actor, 'admin:manage_challenges');
    const flags = readJson<Record<string, AdminContentFlag>>(CHALLENGE_FLAGS_KEY, {});
    flags[challengeId] = { id: challengeId, enabled, updatedAt: new Date().toISOString(), updatedBy: actor };
    writeJson(CHALLENGE_FLAGS_KEY, flags);
    AdminAuditEngine.log(actor, enabled ? 'enable_challenge' : 'disable_challenge', challengeId, 'success');
  },

  listChallengeFlags(actor: string): AdminContentFlag[] {
    requirePermission(actor, 'admin:manage_challenges');
    return Object.values(readJson<Record<string, AdminContentFlag>>(CHALLENGE_FLAGS_KEY, {}));
  },

  // ── Analytics ─────────────────────────────────────────────────────────────

  getAnalytics(actor: string): AdminAnalytics {
    requirePermission(actor, 'admin:view_analytics');
    const progress = loadProgress();
    const overrides = readJson<Record<string, { suspended?: boolean }>>(USER_OVERRIDES_KEY, {});
    const suspended = Object.values(overrides).filter(o => o.suspended).length;
    const labFlags = readJson<Record<string, AdminContentFlag>>(LAB_FLAGS_KEY, {});
    const challengeFlags = readJson<Record<string, AdminContentFlag>>(CHALLENGE_FLAGS_KEY, {});
    const courseFlags = readJson<Record<string, AdminContentFlag>>(COURSE_FLAGS_KEY, {});
    const batches = readJson<Record<string, AdminBatchSummary>>(BATCH_STORE_KEY, {});
    AdminAuditEngine.log(actor, 'view_analytics', 'platform', 'success');
    return {
      totalUsers: 1,
      suspendedUsers: suspended,
      premiumUsers: EntitlementEngine.isPremium() ? 1 : 0,
      totalXpAwarded: progress.xp,
      totalLabsCompleted: progress.completedLabs.length,
      totalChallengesCompleted: progress.completedChallenges.length,
      enabledLabs: Object.values(labFlags).filter(f => f.enabled).length,
      enabledChallenges: Object.values(challengeFlags).filter(f => f.enabled).length,
      enabledCourses: Object.values(courseFlags).filter(f => f.enabled).length,
      activeBatches: Object.values(batches).filter(b => !b.archived).length,
    };
  },

  // ── Audit Log ─────────────────────────────────────────────────────────────

  getAuditLog(actor: string) {
    requirePermission(actor, 'admin:view_audit_logs');
    return AdminAuditEngine.getAll();
  },

  clearAuditLog(actor: string): void {
    // Only Super Admin may clear the audit log
    if (!PermissionEngine.hasPermission(actor, 'superadmin:all')) {
      AdminAuditEngine.log(actor, 'clear_audit_log', 'audit', 'denied', 'Requires Super Admin');
      throw new Error('[AdminEngine] Only Super Admin can clear the audit log.');
    }
    AdminAuditEngine.clear();
  },
};

export default AdminEngine;
