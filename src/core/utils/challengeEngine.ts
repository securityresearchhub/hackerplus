import { loadProgress, saveProgress } from './progressEngine';
import { restoreSessionState, saveSessionState } from './autoSaveEngine';
import challengesConfig from '../../../data/challenges.json';

export interface ChallengeInfo {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  xp: number;
  duration: string;
  locked: boolean;
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
  /**
   * Retrieves the challenges list from the catalog mapped with dynamic completion and active state.
   */
  getChallenges(): ChallengeInfo[] {
    const progress = loadProgress();
    const session = restoreSessionState();
    return (challengesConfig as any[]).map(ch => {
      const details = CHALLENGE_DETAILS[ch.id] || {
        briefing: `Gain root access inside the target ${ch.category} node. Locate vulnerability vectors and extract the flag value to solve the objective.`,
        objectives: ["Perform passive reconnaissance on target network", "Locate security vulnerabilities or configuration gaps", "Escalate session privileges to root", "Retrieve flag.txt from the administrator account"],
        targetIp: `10.10.${Math.floor(Math.random() * 254) + 1}.${Math.floor(Math.random() * 254) + 1}`,
        hint: "Inspect local service ports, configuration folders, or environment attributes for info."
      };
      return {
        ...ch,
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
   * Resets the completion status of a challenge in progressEngine storage and marks it active.
   * Keeps the total earned XP intact.
   */
  replayChallenge(challengeId: string): void {
    const progress = loadProgress();
    progress.completedChallenges = progress.completedChallenges.filter(id => id !== challengeId);
    saveProgress(progress);

    saveSessionState({
      currentChallengeId: challengeId,
    });
  }
};

export default ChallengeEngine;
