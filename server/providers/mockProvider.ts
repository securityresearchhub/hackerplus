/**
 * MockProvider — Phase 1 implementation.
 * Returns instantly-ready fake lab URLs without any real container orchestration.
 * Validates the full polling + session lifecycle flow end-to-end.
 * Replace this with dockerProvider.ts in Phase 2.
 */
import type { LabProvider, ProvisionResult } from './labProvider.interface.js';

// Simulates the IP range a Docker bridge network would assign
function generateFakeIp(): string {
  const host = Math.floor(Math.random() * 253) + 2;
  return `10.10.85.${host}`;
}

// Maps lab IDs to typical target ports
const LAB_PORT_MAP: Record<string, number> = {
  lab1: 8080,
  lab2: 4444,
  lab3: 22,
  lab4: 389,
  lab5: 6443,
  lab6: 3389,
  lab7: 9200,
  lab8: 7000,
  lab9: 5555,
  lab10: 8443,
};

export const MockProvider: LabProvider = {
  async start(labId: string, labSessionId: string, envVars?: string[]): Promise<ProvisionResult> {
    // Simulate container cold-start time (1.5s)
    await new Promise(resolve => setTimeout(resolve, 1500));

    const ip = generateFakeIp();
    const port = LAB_PORT_MAP[labId] ?? 8080;
    return {
      containerId: `mock_${labSessionId.substring(0, 8)}`,
      labUrl: `http://${ip}:${port}`,
    };
  },

  async stop(containerId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    // No-op: nothing real to terminate
  },

  async status(containerId: string): Promise<'running' | 'stopped' | 'unknown'> {
    if (containerId.startsWith('mock_')) return 'running';
    return 'unknown';
  },
};

export default MockProvider;
