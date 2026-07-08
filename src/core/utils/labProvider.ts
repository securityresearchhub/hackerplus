export interface ProvisionResult {
  targetIp: string;
  targetUrl: string;
}

export interface LabProvider {
  /**
   * Provision a unique instance for a target lab.
   */
  provision(labId: string): Promise<ProvisionResult>;
  /**
   * Terminate the target instance when the user aborts or solves the lab.
   */
  terminate(labId: string): Promise<void>;
}

/**
 * Concrete implementation representing a Docker containers manager.
 * Can be swapped easily for a Kubernetes provider, AWS VM builder, etc.
 */
export const MockDockerProvider: LabProvider = {
  async provision(labId: string): Promise<ProvisionResult> {
    // Simulate network delay for starting container instances
    await new Promise(resolve => setTimeout(resolve, 1000));
    const hostIdx = Math.floor(Math.random() * 253) + 2;
    const ip = `10.10.85.${hostIdx}`;
    return {
      targetIp: ip,
      targetUrl: `http://${ip}:80`,
    };
  },

  async terminate(labId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
  }
};

export const ActiveLabProvider: LabProvider = MockDockerProvider;
