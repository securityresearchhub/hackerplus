/**
 * LabRegistry — In-memory session store.
 * Tracks all active lab sessions. In Phase 3+, replace with Redis or a database.
 */

export type SessionStatus = 'provisioning' | 'running' | 'terminated' | 'expired';

export interface LabSession {
  labSessionId: string;
  labId: string;
  userId: string;
  status: SessionStatus;
  containerId: string | null;
  labUrl: string | null;
  startedAt: string;
  expiresAt: string;
  terminatedAt: string | null;
}

const DEFAULT_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

class LabRegistryClass {
  private sessions = new Map<string, LabSession>();

  create(labSessionId: string, labId: string, userId: string): LabSession {
    const now = new Date();
    const session: LabSession = {
      labSessionId,
      labId,
      userId,
      status: 'provisioning',
      containerId: null,
      labUrl: null,
      startedAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + DEFAULT_TTL_MS).toISOString(),
      terminatedAt: null,
    };
    this.sessions.set(labSessionId, session);
    return session;
  }

  get(labSessionId: string): LabSession | undefined {
    return this.sessions.get(labSessionId);
  }

  markRunning(labSessionId: string, containerId: string, labUrl: string): void {
    const session = this.sessions.get(labSessionId);
    if (session) {
      session.status = 'running';
      session.containerId = containerId;
      session.labUrl = labUrl;
    }
  }

  markTerminated(labSessionId: string): void {
    const session = this.sessions.get(labSessionId);
    if (session) {
      session.status = 'terminated';
      session.terminatedAt = new Date().toISOString();
    }
  }

  markExpired(labSessionId: string): void {
    const session = this.sessions.get(labSessionId);
    if (session) {
      session.status = 'expired';
      session.terminatedAt = new Date().toISOString();
    }
  }

  /** Returns all sessions with status 'running' that have passed their expiresAt. */
  getExpiredSessions(): LabSession[] {
    const now = Date.now();
    return Array.from(this.sessions.values()).filter(
      s => s.status === 'running' && new Date(s.expiresAt).getTime() < now
    );
  }

  /** Returns the currently active session for a user + lab combination, if any. */
  getActiveForUser(userId: string, labId: string): LabSession | undefined {
    return Array.from(this.sessions.values()).find(
      s => s.userId === userId && s.labId === labId && s.status === 'running'
    );
  }
}

export const LabRegistry = new LabRegistryClass();
export default LabRegistry;
