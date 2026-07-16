/**
 * dockerProvider.ts
 * Real Docker LabProvider implementation.
 *
 * Implements the full LabProvider interface contract.
 * Leverages ContainerService to manage container lifecycles.
 *
 * LAB-003 / LAB-005: labUrl now comes from ContainerService (Traefik subdomain).
 */
import type { LabProvider, ProvisionResult } from './labProvider.interface.js';
import { ContainerService } from '../services/containerService.js';

// Maps frontend labId values to Docker image names.
// Add new entries here when new labs are added to the platform.
const LAB_IMAGE_MAP: Record<string, string> = {
  'lab1':       'hp-sqli-v1',
  'lab2':       'hp-idor-v1',
  'hp-sqli-v1': 'hp-sqli-v1',
  'hp-idor-v1': 'hp-idor-v1',
};

function resolveImage(labId: string): string {
  // If it's already a direct image reference (e.g. "nginx:alpine"), use as-is
  if (labId.includes(':') || labId.includes('/')) {
    return labId;
  }
  return LAB_IMAGE_MAP[labId] ?? 'hp-sqli-v1';
}

export const DockerProvider: LabProvider & {
  startLab(labId: string, labSessionId: string): Promise<any>;
  stopLab(containerId: string): Promise<void>;
  getStatus(containerId: string): Promise<'provisioning' | 'running' | 'stopped' | 'failed'>;
} = {
  /**
   * LabProvider interface wrapper for start
   */
  async start(labId: string, labSessionId: string, envVars?: string[]): Promise<ProvisionResult> {
    const result = await this.startLab(labId, labSessionId, envVars);
    return {
      containerId: result.containerId,
      labUrl:      result.labUrl,          // subdomain URL from ContainerService
    };
  },

  /**
   * LabProvider interface wrapper for stop
   */
  async stop(containerId: string): Promise<void> {
    return this.stopLab(containerId);
  },

  /**
   * LabProvider interface wrapper for status
   */
  async status(containerId: string): Promise<'running' | 'stopped' | 'unknown'> {
    const statusVal = await this.getStatus(containerId);
    if (statusVal === 'running') return 'running';
    if (statusVal === 'stopped') return 'stopped';
    return 'unknown';
  },

  // ── Explicit LAB-003 Named Implementations ────────────────────────────────

  /**
   * Provision a real container.
   */
  async startLab(labId: string, labSessionId: string, envVars?: string[]): Promise<any> {
    const image = resolveImage(labId);
    console.log(`[DockerProvider] startLab — labId=${labId}, image=${image}`);
    const info = await ContainerService.startContainer(image, labSessionId, envVars);
    return {
      sessionId:   labSessionId,
      containerId: info.containerId,
      ipAddress:   info.ipAddress,
      hostPort:    info.hostPort,
      labUrl:      info.labUrl,            // subdomain or localhost fallback
      status:      info.status,
      startedAt:   info.startedAt,
    };
  },

  /**
   * Stop and remove a container.
   */
  async stopLab(containerId: string): Promise<void> {
    console.log(`[DockerProvider] stopLab — containerId=${containerId}`);
    await ContainerService.stopContainer(containerId);
  },

  /**
   * Get the current status of a container.
   */
  async getStatus(containerId: string): Promise<'provisioning' | 'running' | 'stopped' | 'failed'> {
    return ContainerService.getContainerStatus(containerId);
  },
};

export default DockerProvider;
