/**
 * adminAuditEngine.ts
 * Append-only admin action audit log.
 *
 * Persists entries to `hp_admin_audit` localStorage key.
 * Only AdminEngine writes here — never the UI directly.
 */

const STORAGE_KEY = 'hp_admin_audit';

// ── Types ─────────────────────────────────────────────────────────────────────

export type AuditOutcome = 'success' | 'denied' | 'error';

export interface AuditEntry {
  readonly id: string;
  readonly timestamp: string;   // ISO 8601
  readonly actor: string;       // username performing the action
  readonly action: string;      // e.g. 'suspend_user', 'disable_lab'
  readonly target: string;      // e.g. username, courseId, labId
  readonly outcome: AuditOutcome;
  readonly detail?: string;     // optional extra context
}

// ── Persistence Helpers ───────────────────────────────────────────────────────

function loadLog(): AuditEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuditEntry[]) : [];
  } catch {
    return [];
  }
}

function saveLog(entries: AuditEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (err) {
    console.error('[AdminAuditEngine] Failed to persist audit log.', err);
  }
}

function generateId(): string {
  return `audit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// ── AdminAuditEngine ──────────────────────────────────────────────────────────

export const AdminAuditEngine = {
  /**
   * Appends a new entry to the immutable audit log.
   */
  log(
    actor: string,
    action: string,
    target: string,
    outcome: AuditOutcome,
    detail?: string,
  ): void {
    const entry: AuditEntry = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      actor,
      action,
      target,
      outcome,
      ...(detail !== undefined ? { detail } : {}),
    };
    const entries = loadLog();
    entries.push(entry);
    saveLog(entries);
  },

  /** Returns all audit entries, newest first. */
  getAll(): AuditEntry[] {
    return loadLog().slice().reverse();
  },

  /** Returns audit entries filtered by actor callsign. */
  getByActor(actor: string): AuditEntry[] {
    return loadLog()
      .filter(e => e.actor === actor)
      .reverse();
  },

  /** Returns audit entries filtered by action type. */
  getByAction(action: string): AuditEntry[] {
    return loadLog()
      .filter(e => e.action === action)
      .reverse();
  },

  /**
   * Clears the audit log entirely.
   * Only callable by Super Admin — enforcement is in AdminEngine.
   */
  clear(): void {
    saveLog([]);
  },
};

export default AdminAuditEngine;
