import { loadProgress, saveProgress } from './progressEngine';
import { restoreSessionState, saveSessionState } from './autoSaveEngine';
import { EntitlementEngine } from './entitlementEngine';
import challengesConfig from '../../../data/challenges.json';

export interface ChallengeInfo {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  xp: number;
  duration: string;
  /** Progression lock — prerequisite challenge not yet completed */
  locked: boolean;
  /** Entitlement lock — requires a paid plan to access */
  premiumLocked: boolean;
  completed: boolean;
  active: boolean;
  briefing: string;
  objectives: string[];
  targetIp: string;
  hint: string;
}

const CHALLENGE_DETAILS: { [id: string]: { briefing: string; objectives: string[]; targetIp: string; hint: string } } = {
  ch1: {
    briefing: "An upload portal on the target website does not validate file extensions. Exploiting this unrestricted file upload can allow uploading a web shell for remote code execution.",
    objectives: ["Enumerate the target web server ports", "Locate the unrestricted upload directory", "Upload a custom php/asp shell", "Retrieve the flag from /var/www/flag.txt"],
    targetIp: "10.10.83.12",
    hint: "Try uploading a file with a .php extension, and check if you can run phpinfo()."
  },
  ch2: {
    briefing: "The target template rendering engine is vulnerable to Server-Side Template Injection. Exploit this vulnerability to run shell commands on the host machine.",
    objectives: ["Identify template engine type (Jinja2/Mako)", "Inject payload into template fields", "Establish command execution capability", "Acquire flag from system environment variables"],
    targetIp: "10.10.142.95",
    hint: "Check if the engine evaluates mathematical expressions like {{ 7 * 7 }} inside user inputs."
  },
  ch3: {
    briefing: "A custom Linux utility is configured to execute helper scripts using relative system paths. Manipulate the PATH variable to execute a privilege escalation binary.",
    objectives: ["Analyze relative shell execution patterns", "Create a fake command file in writable directory", "Append directory to PATH variable", "Execute custom command as root and capture the flag"],
    targetIp: "10.10.220.17",
    hint: "Inspect which binaries run with SUID permissions and see if they execute commands without absolute paths."
  }
};

export const ChallengeEngine = {
  /** Returns the ordered list of all challenge IDs. Used by SessionEngine for entitlement checks. */
  allChallengeIds(): string[] {
    return (challengesConfig as any[]).map(c => c.id);
  },

  /**
   * Retrieves the challenges list from the catalog mapped with dynamic completion and active state.
   */
  getChallenges(): ChallengeInfo[] {
    const progress = loadProgress();
    const session = restoreSessionState();
    const ids = this.allChallengeIds();

    return (challengesConfig as any[]).map(ch => {
      const details = CHALLENGE_DETAILS[ch.id] || {
        briefing: `Gain root access inside the target ${ch.category} node. Locate vulnerability vectors and extract the flag value to solve the objective.`,
        objectives: ["Perform passive reconnaissance on target network", "Locate security vulnerabilities or configuration gaps", "Escalate session privileges to root", "Retrieve flag.txt from the administrator account"],
        targetIp: `10.10.${Math.floor(Math.random() * 254) + 1}.${Math.floor(Math.random() * 254) + 1}`,
        hint: "Inspect local service ports, configuration folders, or environment attributes for info."
      };
      let locked = ch.locked;
      if (ch.id === 'ch5') {
        locked = !progress.completedChallenges.includes('ch4');
      } else if (ch.id === 'ch8') {
        locked = !progress.completedChallenges.includes('ch7');
      }

      // Entitlement lock — plan-based access gate (independent of progression)
      const premiumLocked = !EntitlementEngine.canAccessChallenge(ch.id, ids);

      return {
        ...ch,
        locked,
        premiumLocked,
        completed: progress.completedChallenges.includes(ch.id),
        active: session.currentChallengeId === ch.id,
        ...details
      };
    });
  },

  /**
   * Starts a challenge by setting it as active in the session state storage.
   */
  startChallenge(challengeId: string | null): void {
    saveSessionState({
      currentChallengeId: challengeId,
    });
  },

  /**
   * Sets the completed challenge as active in session state to allow replaying.
   * Keeps completedChallenges and total earned XP unchanged.
   */
  replayChallenge(challengeId: string): void {
    saveSessionState({
      currentChallengeId: challengeId,
    });
  },

  /**
   * Completes a challenge by removing the active session from state.
   */
  completeChallenge(challengeId: string): void {
    saveSessionState({
      currentChallengeId: null,
    });
  }
};

export default ChallengeEngine;
