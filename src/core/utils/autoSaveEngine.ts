import { UserProgress, loadProgress, saveProgress } from './progressEngine';
import { calculateProgress, ProgressResult } from './xpEngine';
import levelConfig from '../../../data/levels.json';

export interface UserSettings {
  theme: 'dark' | 'light';
  accentColor: string;
  notificationsEnabled: boolean;
}

export interface SessionState {
  currentLessonId: string | null;
  currentLabId: string | null;
  currentChallengeId: string | null;
  lastOpenScreen: string;
  userSettings: UserSettings;
}

export interface CompleteSession {
  progress: UserProgress;
  session: SessionState;
  /** Pre-computed XP progress snapshot. UI must never call calculateProgress directly. */
  xpProgress: ProgressResult;
}

const SESSION_STORAGE_KEY = 'hp_session_state';

const DEFAULT_SETTINGS: UserSettings = {
  theme: 'dark',
  accentColor: '#00e676', // Cyber Green default
  notificationsEnabled: true,
};

const DEFAULT_SESSION: SessionState = {
  currentLessonId: null,
  currentLabId: null,
  currentChallengeId: null,
  lastOpenScreen: '/dashboard',
  userSettings: DEFAULT_SETTINGS,
};

/**
 * Automatically saves a session block value to localStorage.
 */
export function saveSessionState(session: Partial<SessionState>): void {
  try {
    const current = restoreSessionState();
    const updated = { ...current, ...session };
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to auto-save session state.', err);
  }
}

/**
 * Automatically restores a session block value from localStorage.
 */
export function restoreSessionState(): SessionState {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SESSION };
    return { ...DEFAULT_SESSION, ...JSON.parse(raw) };
  } catch (err) {
    console.error('Failed to restore session state. Falling back.', err);
    return { ...DEFAULT_SESSION };
  }
}

/**
 * Consolidates loading both progress metrics and session variables on app launch.
 */
export function loadCompleteSession(): CompleteSession {
  const progress = loadProgress();
  return {
    progress,
    session: restoreSessionState(),
    xpProgress: calculateProgress(progress.xp, levelConfig),
  };
}

/**
 * Helper to update and save specific user settings indicators.
 */
export function updateSettings(settings: Partial<UserSettings>): SessionState {
  const currentSession = restoreSessionState();
  const updatedSettings = { ...currentSession.userSettings, ...settings };
  
  const updatedSession = {
    ...currentSession,
    userSettings: updatedSettings,
  };
  
  saveSessionState(updatedSession);
  return updatedSession;
}

/**
 * Helper to update and auto-save the active navigation path.
 */
export function trackOpenScreen(screenPath: string): void {
  saveSessionState({ lastOpenScreen: screenPath });
}

/**
 * Resets all session and progress entries back to default states.
 */
export function clearAllLocalData(): void {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    // Explicitly import and call progress reset
    localStorage.removeItem('hp_user_progress');
  } catch (err) {
    console.error('Failed to clear local persistence data.', err);
  }
}
