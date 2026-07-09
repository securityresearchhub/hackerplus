/**
 * LabOrchestrator — Single dispatch point for all lab lifecycle commands.
 * Routes start/stop/status to the active LabProvider driver.
 * Swap providers here — nothing else changes.
 */
import { v4 as uuidv4 } from 'uuid';
import { LabRegistry } from './labRegistry.js';
import { MockProvider } from '../providers/mockProvider.js';
import type { LabProvider } from '../providers/labProvider.interface.js';

// ── Active Provider ──────────────────────────────────────────
// Phase 1: MockProvider
// Phase 2: import { DockerProvider } from '../providers/dockerProvider.js'
// Phase 3: import { K8sProvider }    from '../providers/k8sProvider.js'
const activeProvider: LabProvider = MockProvider;
// ─────────────────────────────────────────────────────────────

export const LabOrchestrator = {
  /**
   * Creates a new session, provisions a container asynchronously,
   * and updates the registry when the container is ready.
   */
  async startSession(labId: string, userId: string): Promise<string> {
    const labSessionId = `sess_${uuidv4().replace(/-/g, '').substring(0, 12)}`;

    // Register immediately as 'provisioning'
    LabRegistry.create(labSessionId, labId, userId);

    // Provision asynchronously — caller gets the ID and polls for status
    (async () => {
      try {
        const { containerId, labUrl } = await activeProvider.start(labId, labSessionId);
        LabRegistry.markRunning(labSessionId, containerId, labUrl);
        console.log(`[LabOrchestrator] Session ${labSessionId} is running → ${labUrl}`);
      } catch (err) {
        console.error(`[LabOrchestrator] Failed to provision session ${labSessionId}:`, err);
        LabRegistry.markTerminated(labSessionId);
      }
    })();

    return labSessionId;
  },

  /**
   * Terminates an active session and releases the container.
   */
  async stopSession(labSessionId: string): Promise<void> {
    const session = LabRegistry.get(labSessionId);
    if (!session || !session.containerId) return;

    try {
      await activeProvider.stop(session.containerId);
    } catch (err) {
      console.error(`[LabOrchestrator] Error stopping container for ${labSessionId}:`, err);
    } finally {
      LabRegistry.markTerminated(labSessionId);
      console.log(`[LabOrchestrator] Session ${labSessionId} terminated.`);
    }
  },

  /**
   * Terminates all expired sessions. Called by the watchdog on a schedule.
   */
  async sweepExpired(): Promise<number> {
    const expired = LabRegistry.getExpiredSessions();
    for (const session of expired) {
      console.log(`[LabOrchestrator] Sweeping expired session ${session.labSessionId}`);
      if (session.containerId) {
        await activeProvider.stop(session.containerId).catch(() => {});
      }
      LabRegistry.markExpired(session.labSessionId);
    }
    return expired.length;
  },
};

export default LabOrchestrator;
