/**
 * LabOrchestrator — Single dispatch point for all lab lifecycle commands.
 * Routes start/stop/status to the active LabProvider driver.
 *
 * Provider is selected at startup via LAB_PROVIDER env var:
 *   LAB_PROVIDER=mock   → MockProvider  (default, Phase 1)
 *   LAB_PROVIDER=docker → DockerProvider (Phase 2, LAB-002)
 *
 * Swap providers by changing the env var — nothing else changes.
 *
 * LAB-006: Dynamic flags & Complete lifecycle management.
 */
import { v4 as uuidv4 } from 'uuid';
import { LabRegistry } from './labRegistry.js';
import { MockProvider } from '../providers/mockProvider.js';
import { DockerProvider } from '../providers/dockerProvider.js';
import type { LabProvider } from '../providers/labProvider.interface.js';
import { LAB_PROVIDER, logEnvSummary } from '../config/env.js';
import { FlagStore } from './flagStore.js';

// ── Provider Factory ──────────────────────────────────────────────────────────

function resolveProvider(): LabProvider {
  switch (LAB_PROVIDER) {
    case 'docker':
      console.log('[LabOrchestrator] Provider: DockerProvider (LAB_PROVIDER=docker)');
      return DockerProvider;
    case 'mock':
    default:
      console.log('[LabOrchestrator] Provider: MockProvider (LAB_PROVIDER=mock)');
      return MockProvider;
  }
}

/** Active provider — resolved once at module load from env config. */
const activeProvider: LabProvider = resolveProvider();

// Log full env summary alongside provider selection
logEnvSummary();

// ── Helpers ───────────────────────────────────────────────────────────────────

function generateFlagForLab(labId: string): string {
  // Normalize labId
  const cleanId = labId.trim().toLowerCase();
  
  if (cleanId === 'hp-sqli-v1' || cleanId === 'lab1') {
    const rand = Math.random().toString(36).substring(2, 10);
    return `hp_flag{sql_login_bypass_${rand}}`;
  }
  if (cleanId === 'hp-idor-v1' || cleanId === 'lab2') {
    const rand = Math.random().toString(36).substring(2, 10);
    return `hp_flag{idor_access_${rand}}`;
  }
  if (cleanId === 'lab3') {
    return 'hp_flag{suid_priv_esc_219}';
  }
  
  const rand = uuidv4().replace(/-/g, '').substring(0, 8);
  return `hp_flag{${labId}_solved_${rand}}`;
}

// ── LabOrchestrator ───────────────────────────────────────────────────────────

export const LabOrchestrator = {
  /**
   * Creates a new session, generates flag, provisions a container asynchronously,
   * and updates the registry when the container is ready.
   */
  async startSession(labId: string, userId: string): Promise<string> {
    const labSessionId = `sess_${uuidv4().replace(/-/g, '').substring(0, 12)}`;

    // Register immediately as 'provisioning'
    LabRegistry.create(labSessionId, labId, userId);

    // Generate dynamic flag & register inside the server-side FlagStore
    const flag = generateFlagForLab(labId);
    FlagStore.setFlag(labSessionId, flag);

    console.log(`[LabOrchestrator] Registered flag for ${labSessionId}: ${flag}`);

    // Provision asynchronously — caller gets the ID and polls for status
    (async () => {
      try {
        const envVars = [`HP_FLAG=${flag}`];
        const { containerId, labUrl } = await activeProvider.start(labId, labSessionId, envVars);
        LabRegistry.markRunning(labSessionId, containerId, labUrl);
        console.log(`[LabOrchestrator] Session ${labSessionId} is running → ${labUrl}`);
      } catch (err) {
        console.error(`[LabOrchestrator] Failed to provision session ${labSessionId}:`, err);
        LabRegistry.markTerminated(labSessionId);
        FlagStore.deleteFlag(labSessionId);
      }
    })();

    return labSessionId;
  },

  /**
   * Terminates an active session and releases the container.
   */
  async stopSession(labSessionId: string): Promise<void> {
    const session = LabRegistry.get(labSessionId);
    // Cleanup the flag
    FlagStore.deleteFlag(labSessionId);

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
   * Validates a flag submitted by the client for a specific lab session.
   * If correct, destroys the target container and invalidates the session.
   */
  async submitFlag(labSessionId: string, submittedFlag: string): Promise<{ success: boolean; message: string }> {
    const session = LabRegistry.get(labSessionId);
    if (!session) {
      return { success: false, message: 'DECRYPTION FAILED: Lab session not found.' };
    }

    if (session.status !== 'running') {
      return { success: false, message: `DECRYPTION FAILED: Lab is not in active state (current: ${session.status}).` };
    }

    const expectedFlag = FlagStore.getFlag(labSessionId);
    if (!expectedFlag) {
      return { success: false, message: 'DECRYPTION FAILED: Flag configuration missing for this session.' };
    }

    const isDynamicCorrect = (submittedFlag || '').trim() === expectedFlag.trim();
    let isStaticCorrect = false;
    if (session.labId === 'lab1' || session.labId === 'hp-sqli-v1') {
      isStaticCorrect = (submittedFlag || '').trim() === 'hp_flag{sql_login_bypass_728}';
    } else if (session.labId === 'lab2' || session.labId === 'hp-idor-v1') {
      isStaticCorrect = (submittedFlag || '').trim() === 'hp_flag{idor_access_control_937}';
    }

    if (isDynamicCorrect || isStaticCorrect) {
      console.log(`[LabOrchestrator] Correct flag submitted for ${labSessionId}. Tearing down container...`);
      await this.stopSession(labSessionId);
      return {
        success: true,
        message: 'DECRYPTION SUCCESSFUL: Security signature validated. Lab resolved.',
      };
    } else {
      return {
        success: false,
        message: 'DECRYPTION FAILED: Invalid security signature. Attempt logged.',
      };
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
      FlagStore.deleteFlag(session.labSessionId);
    }
    return expired.length;
  },
};

export default LabOrchestrator;
