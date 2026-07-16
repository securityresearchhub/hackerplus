/**
 * LabProvider Interface Contract.
 * Every infrastructure driver (Docker, Kubernetes, Cloud VM) must implement this.
 * Swapping providers requires only changing the active driver — zero API or UI changes.
 */

export interface ProvisionResult {
  containerId: string;
  labUrl: string;
}

export interface LabProvider {
  /** Spin up a new isolated instance for the given lab image config. */
  start(labId: string, labSessionId: string, envVars?: string[]): Promise<ProvisionResult>;
  /** Terminate an active instance. */
  stop(containerId: string): Promise<void>;
  /** Check the current runtime status of an instance. */
  status(containerId: string): Promise<'running' | 'stopped' | 'unknown'>;
}
