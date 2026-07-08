import { loadProgress, saveProgress } from './progressEngine';
import { restoreSessionState, saveSessionState } from './autoSaveEngine';
import labsConfig from '../../../data/labs.json';
import { ActiveLabProvider } from './labProvider';

export interface LabInfo {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  duration: string;
  xp: number;
  completed: boolean;
  locked: boolean;
  inProgress: boolean;
  targetIp?: string;
  targetUrl?: string;
}

export const LabEngine = {
  /**
   * Retrieves the dynamic labs catalog with lock overrides and progress status mapping.
   * Locked levels mask titles and categories to keep vulnerability details hidden.
   */
  getLabs(): LabInfo[] {
    const progress = loadProgress();
    const session = restoreSessionState();
    const completedList = progress.completedLabs || [];

    return (labsConfig as any[]).map((lab, idx) => {
      // Progression lock logic: A level remains locked until the preceding level is completed
      let locked = false;
      if (idx > 0) {
        const prevLab = labsConfig[idx - 1];
        locked = !completedList.includes(prevLab.id);
      }

      const completed = completedList.includes(lab.id);
      const inProgress = session.currentLabId === lab.id;

      if (locked) {
        return {
          ...lab,
          title: `🔒 Decrypt Level ${idx + 1} Target`,
          category: 'Encrypted Level',
          locked: true,
          completed: false,
          inProgress: false,
        };
      }

      return {
        ...lab,
        locked: false,
        completed,
        inProgress,
        targetIp: inProgress ? (session as any).targetIp : undefined,
        targetUrl: inProgress ? (session as any).targetUrl : undefined,
      };
    });
  },

  /**
   * Initializes a target lab by calling the active LabProvider driver.
   */
  async initializeLab(labId: string): Promise<void> {
    const session = restoreSessionState();
    if (session.currentLabId) {
      await ActiveLabProvider.terminate(session.currentLabId);
    }

    const result = await ActiveLabProvider.provision(labId);

    saveSessionState({
      currentLabId: labId,
      ...({
        targetIp: result.targetIp,
        targetUrl: result.targetUrl,
      } as any)
    });
  },

  /**
   * Terminates the active lab session and updates session state registry.
   */
  async terminateLab(labId: string): Promise<void> {
    await ActiveLabProvider.terminate(labId);
    saveSessionState({
      currentLabId: null,
      ...({
        targetIp: undefined,
        targetUrl: undefined,
      } as any)
    });
  }
};

export default LabEngine;
