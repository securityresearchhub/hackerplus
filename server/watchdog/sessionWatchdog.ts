/**
 * SessionWatchdog — Background job that sweeps expired lab sessions.
 * Runs on a configurable interval and terminates any session past its TTL.
 */
import { LabOrchestrator } from '../services/labOrchestrator.js';

const SWEEP_INTERVAL_MS = 5 * 60 * 1000; // every 5 minutes

export function startWatchdog(): NodeJS.Timeout {
  console.log('[SessionWatchdog] Started — sweeping every 5 minutes.');

  return setInterval(async () => {
    try {
      const count = await LabOrchestrator.sweepExpired();
      if (count > 0) {
        console.log(`[SessionWatchdog] Swept ${count} expired session(s).`);
      }
    } catch (err) {
      console.error('[SessionWatchdog] Sweep error:', err);
    }
  }, SWEEP_INTERVAL_MS);
}
