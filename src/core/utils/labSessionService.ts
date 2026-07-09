/**
 * LabSessionService — Frontend API client for the Lab Session backend.
 * All lab provisioning, polling, and termination goes through here.
 * The UI never calls fetch() directly. SessionEngine calls this service.
 */

const API_BASE = '/api/lab';

export interface LabSessionStatus {
  labSessionId: string;
  labId: string;
  status: 'provisioning' | 'running' | 'terminated' | 'expired';
  labUrl: string | null;
  expiresAt: string | null;
  startedAt: string | null;
}

export interface StartSessionResult {
  labSessionId: string;
  pollUrl: string;
  /** Present when the server returns an already-running session (HTTP 200 shortcut). */
  status?: string;
  labUrl?: string | null;
  expiresAt?: string | null;
}

export const LabSessionService = {
  /**
   * Requests a new lab session. Returns a labSessionId to poll.
   * If the user already has a running session for the lab, returns the existing one.
   */
  async startSession(labId: string, userId: string): Promise<StartSessionResult> {
    const response = await fetch(`${API_BASE}/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ labId, userId }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Failed to start lab session.' }));
      throw new Error(err.error ?? 'Failed to start lab session.');
    }

    return response.json();
  },

  /**
   * Polls the status of an active session.
   * cache:'no-store' prevents the browser from sending If-None-Match conditional
   * requests that cause Express to return 304 Not Modified, which hangs the
   * Vite proxy because a 304 carries no body for fetch() to resolve against.
   */
  async getSessionStatus(labSessionId: string): Promise<LabSessionStatus> {
    const response = await fetch(`${API_BASE}/${labSessionId}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Lab session not found or already terminated.');
    }

    return response.json();
  },

  /**
   * Polls until the session reaches 'running' status or times out.
   * Resolves with the final session status when ready.
   */
  async waitUntilRunning(
    labSessionId: string,
    onStatusUpdate?: (status: LabSessionStatus) => void,
    timeoutMs = 60000
  ): Promise<LabSessionStatus> {
    const POLL_INTERVAL = 2000;
    const deadline = Date.now() + timeoutMs;

    while (Date.now() < deadline) {
      const status = await this.getSessionStatus(labSessionId);
      onStatusUpdate?.(status);

      if (status.status === 'running') return status;
      if (status.status === 'terminated' || status.status === 'expired') {
        throw new Error(`Lab session ended unexpectedly: ${status.status}`);
      }

      await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
    }

    throw new Error('Timed out waiting for lab session to become ready.');
  },

  /**
   * Terminates an active lab session.
   */
  async stopSession(labSessionId: string): Promise<void> {
    const response = await fetch(`${API_BASE}/${labSessionId}/stop`, {
      method: 'POST',
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Failed to stop session.' }));
      throw new Error(err.error ?? 'Failed to stop session.');
    }
  },
};

export default LabSessionService;
