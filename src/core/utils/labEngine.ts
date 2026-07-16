/**
 * LabEngine — Frontend lab lifecycle manager.
 * Delegates all container provisioning to LabSessionService (real API).
 * Never calls MockDockerProvider directly. Never embeds infrastructure logic.
 */
import { loadProgress, saveProgress } from './progressEngine';
import { restoreSessionState, saveSessionState } from './autoSaveEngine';
import { LabSessionService, type LabSessionStatus } from './labSessionService';
import { EntitlementEngine } from './entitlementEngine';
import labsConfig from '../../../data/labs.json';

export interface LabInfo {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  duration: string;
  xp: number;
  completed: boolean;
  /** Progression lock — previous lab not yet completed */
  locked: boolean;
  /** Entitlement lock — requires a paid plan to access */
  premiumLocked: boolean;
  inProgress: boolean;
  targetIp?: string;
  targetUrl?: string;
}

export const LabEngine = {
  /**
   * Retrieves the dynamic labs catalog with lock overrides and progress status mapping.
   * Locked levels mask titles and categories to keep vulnerability details hidden.
   */
  /** Returns the ordered list of all lab IDs. Used by SessionEngine for entitlement checks. */
  allLabIds(): string[] {
    return (labsConfig as any[]).map(l => l.id);
  },

  getLabs(): LabInfo[] {
    const progress = loadProgress();
    const session = restoreSessionState();
    const completedList = progress.completedLabs || [];
    const ids = this.allLabIds();

    return (labsConfig as any[]).map((lab, idx) => {
      // Progression lock logic: a level remains locked until the preceding level is completed
      let locked = false;
      if (idx > 0) {
        const prevLab = labsConfig[idx - 1];
        locked = !completedList.includes(prevLab.id);
      }

      // Entitlement lock — plan-based access gate (independent of progression)
      const premiumLocked = !EntitlementEngine.canAccessLab(lab.id, ids);

      const completed = completedList.includes(lab.id);
      const inProgress = session.currentLabId === lab.id;

      if (locked) {
        return {
          ...lab,
          title: `🔒 Decrypt Level ${idx + 1} Target`,
          category: 'Encrypted Level',
          locked: true,
          premiumLocked,
          completed: false,
          inProgress: false,
        };
      }

      return {
        ...lab,
        locked: false,
        premiumLocked,
        completed,
        inProgress,
        // Surface the real API-assigned URL if this lab is currently active
        targetIp: inProgress ? (session.activeLabUrl ? new URL(session.activeLabUrl).hostname : undefined) : undefined,
        targetUrl: inProgress ? session.activeLabUrl ?? undefined : undefined,
      };
    });
  },

  /**
   * Initializes a target lab session via the Lab Session API.
   * Awaits the full provisioning poll — only resolves once the session is running
   * and the target URL is saved. This ensures notifyChange() fires with a complete state.
   */
  async initializeLab(
    labId: string,
    onStatusUpdate?: (status: LabSessionStatus) => void
  ): Promise<string> {
    const session = restoreSessionState();
    const userId = session.username || 'anonymous';

    // Terminate any existing session first
    if (session.activeLabSessionId && session.currentLabId) {
      await LabEngine.terminateLab(session.currentLabId).catch(() => {});
    }

    // Start new session — API returns immediately with labSessionId (and optionally a running status)
    const startResult = await LabSessionService.startSession(labId, userId);
    const { labSessionId } = startResult;

    // ── Shortcut: server returned an already-running session ─────────────────
    // POST /api/lab/start returns status:'running' + labUrl when the registry
    // already has an active session for this user+lab. Use it directly —
    // no polling needed.
    if (startResult.status === 'running' && startResult.labUrl) {
      saveSessionState({
        currentLabId: labId,
        activeLabSessionId: labSessionId,
        activeLabUrl: startResult.labUrl,
        activeLabExpiresAt: startResult.expiresAt ?? null,
      });
      try {
        window.open(startResult.labUrl, '_blank');
      } catch (e) {
        console.warn('[LabEngine] Popup blocked: could not auto-open lab URL.', e);
      }
      return labSessionId;
    }
    // ─────────────────────────────────────────────────────────────────────────

    // New session: persist the ID, then poll until the container is ready
    saveSessionState({
      currentLabId: labId,
      activeLabSessionId: labSessionId,
      activeLabUrl: null,
      activeLabExpiresAt: null,
    });

    // AWAIT the full polling cycle — initializeLab does NOT resolve until running
    let finalStatus;
    try {
      finalStatus = await LabSessionService.waitUntilRunning(labSessionId, onStatusUpdate);
    } catch (err) {
      // Provisioning failed — clean up session state and re-throw for UI
      saveSessionState({ currentLabId: null, activeLabSessionId: null, activeLabUrl: null });
      throw err;
    }

    // Session is confirmed running — persist the real target URL
    if (finalStatus.labUrl) {
      saveSessionState({
        activeLabUrl: finalStatus.labUrl,
        activeLabExpiresAt: finalStatus.expiresAt,
      });
      try {
        window.open(finalStatus.labUrl, '_blank');
      } catch (e) {
        console.warn('[LabEngine] Popup blocked: could not auto-open lab URL.', e);
      }
    }

    return labSessionId;
  },


  /**
   * Terminates the active lab session via the API and clears session state.
   */
  async terminateLab(_labId: string): Promise<void> {
    const session = restoreSessionState();
    if (session.activeLabSessionId) {
      await LabSessionService.stopSession(session.activeLabSessionId).catch(() => {});
    }
    saveSessionState({
      currentLabId: null,
      activeLabSessionId: null,
      activeLabUrl: null,
      activeLabExpiresAt: null,
    });
  },
};

export default LabEngine;
