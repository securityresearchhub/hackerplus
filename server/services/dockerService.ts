/**
 * dockerService.ts
 * Raw Docker Engine API client — zero third-party dependencies.
 *
 * Communicates with the Docker daemon over Unix socket or TCP using
 * Node.js built-in `http` module. No dockerode, no axios, no fetch.
 *
 * Connection resolution order:
 *   1. DOCKER_HOST=tcp://host:port  → TCP
 *   2. DOCKER_HOST=unix:///path     → Unix socket override
 *   3. Default: dockerConfig.socketPath (/var/run/docker.sock)
 *
 * All public methods are non-throwing — errors are caught internally
 * and reflected in the return value. The server never crashes due to
 * Docker unavailability.
 *
 * LAB-002: Core Docker connectivity layer.
 */
import http from 'http';
import { dockerConfig } from '../config/docker.js';

// ── Connection resolution ─────────────────────────────────────────────────────

interface ConnectionOptions {
  socketPath?: string;
  host?: string;
  port?: number;
}

function resolveConnection(): ConnectionOptions {
  const raw = (process.env.DOCKER_HOST ?? '').trim();

  if (raw.startsWith('tcp://') || raw.startsWith('http://')) {
    const url = new URL(raw.replace(/^tcp:\/\//, 'http://'));
    return {
      host: url.hostname || 'localhost',
      port: parseInt(url.port || '2375', 10),
    };
  }

  if (raw.startsWith('unix://')) {
    return { socketPath: raw.slice(7) };
  }

  // Default: Unix socket from centralized docker config
  return { socketPath: dockerConfig.socketPath };
}

const CONNECTION: ConnectionOptions = resolveConnection();

// ── Raw HTTP helper ───────────────────────────────────────────────────────────

function dockerRequestWithStatus<T>(
  path: string,
  method = 'GET',
  body?: Record<string, unknown>,
): Promise<{ statusCode: number; data: T }> {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : undefined;

    const options: http.RequestOptions = {
      ...CONNECTION,
      path,
      method,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(payload !== undefined
          ? { 'Content-Length': String(Buffer.byteLength(payload)) }
          : {}),
      },
    };

    const req = http.request(options, (res) => {
      const chunks: Buffer[] = [];
      res.on('data', (chunk: Buffer) => chunks.push(chunk));
      res.on('end', () => {
        const text = Buffer.concat(chunks).toString('utf8');
        let data: T;
        try {
          data = JSON.parse(text) as T;
        } catch {
          // Docker /_ping returns plain "OK" — not JSON
          data = text as unknown as T;
        }
        resolve({ statusCode: res.statusCode ?? 500, data });
      });
    });

    req.setTimeout(10000, () => {
      req.destroy(new Error('[DockerService] Request timed out'));
    });

    req.on('error', reject);

    if (payload !== undefined) req.write(payload);
    req.end();
  });
}

function dockerRequest<T>(
  path: string,
  method = 'GET',
  body?: Record<string, unknown>,
): Promise<T> {
  return dockerRequestWithStatus<T>(path, method, body).then((res) => res.data);
}

function parseImageName(image: string): { fromImage: string; tag: string } {
  const parts = image.split(':');
  if (parts.length > 1) {
    const tag = parts.pop()!;
    const fromImage = parts.join(':');
    return { fromImage, tag };
  }
  return { fromImage: image, tag: 'latest' };
}

function pullImageStream(fromImage: string, tag: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const path = `/images/create?fromImage=${encodeURIComponent(fromImage)}&tag=${encodeURIComponent(tag)}`;
    const options: http.RequestOptions = {
      ...CONNECTION,
      path,
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      if (res.statusCode && res.statusCode >= 400) {
        reject(new Error(`Docker pull failed with status ${res.statusCode}`));
        return;
      }
      res.on('data', (chunk) => {
        // No-op - consume stream
      });
      res.on('end', () => {
        resolve();
      });
    });

    req.setTimeout(90000, () => { // 90s timeout for pulling
      req.destroy(new Error('[DockerService] Pull image request timed out after 90s'));
    });

    req.on('error', reject);
    req.end();
  });
}

// ── Docker API response shapes ────────────────────────────────────────────────

interface DockerVersionResponse {
  Version?: string;
  ApiVersion?: string;
  Os?: string;
  Arch?: string;
}

interface DockerImageSummary {
  Id: string;
  RepoTags: string[] | null;
  Size: number;
}

interface DockerContainerSummary {
  Id: string;
  Image: string;
  Status: string;
  State: string;
}

interface DockerNetworkSummary {
  Id: string;
  Name: string;
  Driver: string;
}

// ── Public types ──────────────────────────────────────────────────────────────

export interface DockerHealthStatus {
  connected: boolean;
  dockerVersion: string | null;
  containers: number;
  images: number;
  network: string;
  error?: string;
}

// ── DockerService ─────────────────────────────────────────────────────────────

export const DockerService = {
  // Expose low-level HTTP helper methods for other services (e.g. ContainerService)
  request: dockerRequest,
  requestWithStatus: dockerRequestWithStatus,

  /**
   * Pings the Docker daemon.
   * Returns true if the daemon responds with "OK".
   */
  async ping(): Promise<boolean> {
    try {
      const result = await dockerRequest<string>('/_ping');
      return String(result).trim() === 'OK';
    } catch {
      return false;
    }
  },

  /**
   * Reads the Docker Engine version string.
   * Returns null if the daemon is unreachable.
   */
  async version(): Promise<string | null> {
    try {
      const data = await dockerRequest<DockerVersionResponse>('/version');
      return data.Version ?? null;
    } catch {
      return null;
    }
  },

  /**
   * Lists all images present on the Docker host.
   * Returns an empty array if the daemon is unreachable.
   */
  async listImages(): Promise<DockerImageSummary[]> {
    try {
      const images = await dockerRequest<DockerImageSummary[]>('/images/json');
      return Array.isArray(images) ? images : [];
    } catch {
      return [];
    }
  },

  /**
   * Checks if a Docker image is present locally.
   */
  async imageExists(image: string): Promise<boolean> {
    try {
      const res = await dockerRequestWithStatus<any>(`/images/${encodeURIComponent(image)}/json`);
      return res.statusCode === 200;
    } catch {
      return false;
    }
  },

  /**
   * Pulls an image from the registry.
   */
  async pullImage(image: string): Promise<void> {
    const { fromImage, tag } = parseImageName(image);
    await pullImageStream(fromImage, tag);
  },

  /**
   * Lists all currently running containers.
   * Returns an empty array if the daemon is unreachable.
   */
  async listContainers(): Promise<DockerContainerSummary[]> {
    try {
      const containers = await dockerRequest<DockerContainerSummary[]>('/containers/json');
      return Array.isArray(containers) ? containers : [];
    } catch {
      return [];
    }
  },

  /**
   * Ensures the HackerPlus lab network exists, creating it if absent.
   * Returns true when the network is confirmed present (or just created).
   * Returns false if the operation fails — server continues running.
   */
  async createNetworkIfMissing(): Promise<boolean> {
    try {
      const networks = await dockerRequest<DockerNetworkSummary[]>('/networks');
      const exists =
        Array.isArray(networks) &&
        networks.some((n) => n.Name === dockerConfig.network);

      if (exists) {
        console.log(
          `[DockerService] Network "${dockerConfig.network}" already exists.`,
        );
        return true;
      }

      console.log(
        `[DockerService] Creating bridge network "${dockerConfig.network}"...`,
      );
      await dockerRequest('/networks/create', 'POST', {
        Name: dockerConfig.network,
        Driver: 'bridge',
        CheckDuplicate: true,
      });
      console.log(
        `[DockerService] Network "${dockerConfig.network}" created successfully.`,
      );
      return true;
    } catch (err) {
      console.error('[DockerService] Failed to ensure lab network exists:', err);
      return false;
    }
  },

  /**
   * Aggregated health snapshot for GET /api/system/docker.
   * Runs ping, version, image count, and container count concurrently.
   * Never throws — always returns a structured result.
   */
  async healthCheck(): Promise<DockerHealthStatus> {
    const connected = await this.ping();

    if (!connected) {
      return {
        connected: false,
        dockerVersion: null,
        containers: 0,
        images: 0,
        network: dockerConfig.network,
        error:
          'Docker daemon is unreachable. Check DOCKER_HOST or verify the socket path.',
      };
    }

    const [dockerVersion, images, containers] = await Promise.all([
      this.version(),
      this.listImages(),
      this.listContainers(),
    ]);

    return {
      connected: true,
      dockerVersion,
      containers: containers.length,
      images: images.length,
      network: dockerConfig.network,
    };
  },
};

export default DockerService;
