/**
 * containerService.ts
 * Low-level Docker container lifecycle primitives.
 *
 * Interacts with Docker Engine via DockerService.
 * Handles:
 *   - Image cache checks and pulls
 *   - Resource limits (memory / CPU)
 *   - Host port allocation (fallback access)
 *   - Traefik reverse-proxy label injection for wildcard subdomain routing
 *   - Network attachment to hackerplus_labs bridge
 *
 * LAB-003 / LAB-005
 */
import { DockerService } from './dockerService.js';
import { dockerConfig } from '../config/docker.js';

// ── ContainerInfo: public shape returned by startContainer ───────────────────

export interface ContainerInfo {
  sessionId: string;
  containerId: string;
  ipAddress: string;
  status: 'provisioning' | 'running' | 'stopped' | 'failed';
  startedAt: string;
  /** Fallback host port for direct localhost access (always allocated). */
  hostPort: number;
  /**
   * Primary lab URL exposed to the student.
   * Wildcard subdomain routed through Traefik when DOCKER_LABS_DOMAIN is
   * configured to a real domain. Falls back to http://localhost:<hostPort>
   * when domain is 'localhost' or empty.
   */
  labUrl: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Parse Docker memory string ('512m', '1g') to bytes. */
function parseMemoryToBytes(memStr: string): number {
  const match = memStr.match(/^(\d+)([kmgKMG]?)$/);
  if (!match) return 512 * 1024 * 1024;
  const value = parseInt(match[1], 10);
  const unit = match[2].toUpperCase();
  switch (unit) {
    case 'K': return value * 1024;
    case 'M': return value * 1024 * 1024;
    case 'G': return value * 1024 * 1024 * 1024;
    default:  return value;
  }
}

/** Scan all running containers and return occupied host ports. */
async function findFreeHostPort(): Promise<number> {
  const containers = await DockerService.listContainers();
  const busy = new Set<number>();
  for (const c of containers) {
    const rawPorts = (c as any).Ports as Array<{ PublicPort?: number }> | undefined;
    if (rawPorts) {
      for (const p of rawPorts) {
        if (p.PublicPort) busy.add(p.PublicPort);
      }
    }
  }
  for (let p = dockerConfig.hostPortRangeStart; p <= dockerConfig.hostPortRangeEnd; p++) {
    if (!busy.has(p)) return p;
  }
  throw new Error('[ContainerService] No free host ports available in configured range.');
}

/**
 * Build the Traefik-friendly subdomain for a session.
 * e.g.  portal-sess-abc123.labs.hackerplus.in
 */
function buildSubdomain(sessionId: string): string {
  const safe = sessionId.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase().slice(0, 40);
  return `portal-${safe}.${dockerConfig.labsDomain}`;
}

/**
 * Build the student-facing lab URL.
 * Uses HTTPS via Traefik when a real domain is configured.
 * Falls back to plain HTTP localhost when domain == 'localhost'.
 */
function buildLabUrl(sessionId: string, hostPort: number): string {
  const domain = dockerConfig.labsDomain.trim();
  if (!domain || domain === 'localhost') {
    return `http://localhost:${hostPort}`;
  }
  return `https://${buildSubdomain(sessionId)}`;
}

// ── ContainerService ──────────────────────────────────────────────────────────

export const ContainerService = {

  /** Ensures an image is present locally, pulling from registry if absent. */
  async ensureImage(image: string): Promise<void> {
    const exists = await DockerService.imageExists(image);
    if (!exists) {
      console.log(`[ContainerService] Image "${image}" not cached — pulling...`);
      await DockerService.pullImage(image);
      console.log(`[ContainerService] Image "${image}" ready.`);
    } else {
      console.log(`[ContainerService] Image "${image}" already cached.`);
    }
  },

  /**
   * Provisions and starts a container for the given lab session.
   *
   * Flow:
   *   1. Ensure image is available
   *   2. Allocate free host port (fallback access)
   *   3. Build Traefik routing labels (wildcard subdomain)
   *   4. Create container with labels + resource limits + network
   *   5. Start container
   *   6. Inspect for IP address
   *   7. Return ContainerInfo (includes labUrl)
   */
  async startContainer(image: string, sessionId: string, envVars?: string[]): Promise<ContainerInfo> {
    await this.ensureImage(image);

    const hostPort    = await findFreeHostPort();
    const labUrl      = buildLabUrl(sessionId, hostPort);
    const subdomain   = buildSubdomain(sessionId);
    const routerName  = `hp-${sessionId.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase().slice(0, 40)}`;

    const memoryBytes   = parseMemoryToBytes(dockerConfig.memoryLimit);
    const nanoCpus      = Math.round(dockerConfig.cpuLimit * 1e9);
    const containerName = `hp_${sessionId.replace(/[^a-zA-Z0-9_.-]/g, '_').slice(0, 40)}`;

    // ── Traefik labels ────────────────────────────────────────────────────────
    // These labels are read by Traefik at container-start time and dynamically
    // create an HTTP/HTTPS router pointing to port 80 inside this container.
    const traefikLabels: Record<string, string> = {
      'traefik.enable':                                                   'true',
      [`traefik.http.routers.${routerName}.rule`]:                        `Host(\`${subdomain}\`)`,
      [`traefik.http.routers.${routerName}.entrypoints`]:                 'websecure',
      [`traefik.http.routers.${routerName}.tls`]:                         'true',
      [`traefik.http.services.${routerName}.loadbalancer.server.port`]:   '80',
      // HTTP → HTTPS redirect
      [`traefik.http.routers.${routerName}-http.rule`]:                   `Host(\`${subdomain}\`)`,
      [`traefik.http.routers.${routerName}-http.entrypoints`]:            'web',
      [`traefik.http.routers.${routerName}-http.middlewares`]:            'redirect-to-https@docker',
    };

    // ── HackerPlus metadata labels ────────────────────────────────────────────
    const hpLabels: Record<string, string> = {
      'hackerplus':           'true',
      'hackerplus.session':   sessionId,
      'hackerplus.image':     image,
      'hackerplus.url':       labUrl,
    };

    const createBody: Record<string, unknown> = {
      Image: image,
      Labels: { ...hpLabels, ...traefikLabels },
      ExposedPorts: { '80/tcp': {} },
      HostConfig: {
        NetworkMode: dockerConfig.network,
        Memory:      memoryBytes,
        NanoCpus:    nanoCpus,
        // Host port binding kept as fallback for direct localhost access
        PortBindings: {
          '80/tcp': [{ HostIp: '0.0.0.0', HostPort: String(hostPort) }],
        },
      },
    };

    if (envVars && envVars.length > 0) {
      createBody.Env = envVars;
    }

    console.log(`[ContainerService] Creating "${containerName}" → ${labUrl}`);

    const createRes = await DockerService.request<{ Id: string; message?: string }>(
      `/containers/create?name=${encodeURIComponent(containerName)}`,
      'POST',
      createBody as Record<string, unknown>,
    );

    if (!createRes?.Id) {
      throw new Error(
        `[ContainerService] Container creation failed: ${createRes?.message ?? 'unknown error'}`,
      );
    }

    const containerId = createRes.Id;
    console.log(`[ContainerService] Starting ${containerId.slice(0, 12)}...`);
    await DockerService.request(`/containers/${containerId}/start`, 'POST');

    // Inspect to resolve container IP inside the lab network
    const inspect   = await DockerService.request<any>(`/containers/${containerId}/json`);
    const ipAddress = inspect?.NetworkSettings?.Networks?.[dockerConfig.network]?.IPAddress ?? '';

    return {
      sessionId,
      containerId,
      ipAddress,
      status:    'running',
      startedAt: new Date().toISOString(),
      hostPort,
      labUrl,
    };
  },

  /** Stops and force-removes a container. Non-throwing. */
  async stopContainer(containerId: string): Promise<void> {
    console.log(`[ContainerService] Stopping ${containerId.slice(0, 12)}...`);
    await DockerService
      .request(`/containers/${containerId}/stop?t=${dockerConfig.killGraceSeconds}`, 'POST')
      .catch((err) => console.warn('[ContainerService] Stop warning:', err));

    console.log(`[ContainerService] Removing ${containerId.slice(0, 12)}...`);
    await DockerService
      .request(`/containers/${containerId}?force=true`, 'DELETE')
      .catch((err) => console.warn('[ContainerService] Remove warning:', err));
  },

  /** Returns the runtime state of a container. Never throws. */
  async getContainerStatus(
    containerId: string,
  ): Promise<'provisioning' | 'running' | 'stopped' | 'failed'> {
    try {
      const res   = await DockerService.request<any>(`/containers/${containerId}/json`);
      const state = res?.State;
      if (!state)                        return 'failed';
      if (state.Running)                 return 'running';
      if (state.Dead || state.OOMKilled) return 'failed';
      return 'stopped';
    } catch {
      return 'failed';
    }
  },

  /** Lists all HackerPlus-managed containers (labeled hackerplus=true). */
  async listRunningContainers(): Promise<any[]> {
    try {
      const raw = await DockerService.request<any[]>('/containers/json?all=true');
      if (!Array.isArray(raw)) return [];

      return raw
        .filter((c) => c.Labels?.hackerplus === 'true')
        .map((c) => ({
          containerId: c.Id,
          name:        c.Names?.[0] ?? '',
          image:       c.Image,
          status:      c.State ?? c.Status,
          sessionId:   c.Labels?.['hackerplus.session'] ?? '',
          labUrl:      c.Labels?.['hackerplus.url'] ?? '',
          ports:       c.Ports ?? [],
          created:     c.Created,
        }));
    } catch (err) {
      console.error('[ContainerService] Failed to list containers:', err);
      return [];
    }
  },
};

export default ContainerService;
