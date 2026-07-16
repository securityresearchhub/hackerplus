/**
 * docker.ts
 * Centralized Docker configuration for HackerPlus Lab provisioning.
 *
 * All Docker-specific constants live here.
 * DockerProvider reads from this module — never from scattered env vars.
 * LAB-001: Architecture scaffold (no Docker commands execute yet).
 */

// ── Socket / Daemon ───────────────────────────────────────────────────────────

/** Path to the Docker daemon socket. Overridable via DOCKER_SOCKET env var. */
export const DOCKER_SOCKET: string =
  process.env.DOCKER_SOCKET ?? '/var/run/docker.sock';

// ── Networking ────────────────────────────────────────────────────────────────

/** Default bridge network for all lab containers. */
export const DEFAULT_NETWORK: string =
  process.env.DOCKER_NETWORK ?? 'hackerplus_labs';

// ── Image Registry ────────────────────────────────────────────────────────────

/** Default container image registry prefix. */
export const DEFAULT_REGISTRY: string =
  process.env.DOCKER_REGISTRY ?? 'registry.hackerplus.io/labs';

// ── Container Lifecycle ───────────────────────────────────────────────────────

/** Default container TTL in seconds (2 hours). */
export const CONTAINER_TTL_SECONDS: number =
  Number(process.env.CONTAINER_TTL_SECONDS ?? 7200);

/** Grace period in seconds before a TTL-expired container is force-killed. */
export const CONTAINER_KILL_GRACE_SECONDS: number =
  Number(process.env.CONTAINER_KILL_GRACE_SECONDS ?? 30);

// ── Resource Limits ───────────────────────────────────────────────────────────

/** Memory limit per container (Docker format: '512m', '1g'). */
export const CONTAINER_MEMORY_LIMIT: string =
  process.env.CONTAINER_MEMORY_LIMIT ?? '512m';

/** CPU quota as a fractional number of cores (0.5 = half a core). */
export const CONTAINER_CPU_LIMIT: number =
  Number(process.env.CONTAINER_CPU_LIMIT ?? 0.5);

/** Maximum number of concurrent running containers across all sessions. */
export const MAX_CONCURRENT_CONTAINERS: number =
  Number(process.env.MAX_CONCURRENT_CONTAINERS ?? 50);

// ── Port Allocation ───────────────────────────────────────────────────────────

/** Host port range start for container port mapping. */
export const HOST_PORT_RANGE_START: number =
  Number(process.env.HOST_PORT_RANGE_START ?? 20000);

/** Host port range end for container port mapping. */
export const HOST_PORT_RANGE_END: number =
  Number(process.env.HOST_PORT_RANGE_END ?? 29999);

// ── Wildcard Lab Domain (LAB-005) ─────────────────────────────────────────────

/** Wildcard root domain for reverse proxying containers. */
export const DOCKER_LABS_DOMAIN: string =
  process.env.DOCKER_LABS_DOMAIN ?? 'labs.hackerplus.in';

// ── Exported Config Object ────────────────────────────────────────────────────

export interface DockerConfig {
  socketPath: string;
  network: string;
  registry: string;
  containerTtlSeconds: number;
  killGraceSeconds: number;
  memoryLimit: string;
  cpuLimit: number;
  maxConcurrentContainers: number;
  hostPortRangeStart: number;
  hostPortRangeEnd: number;
  labsDomain: string;
}

export const dockerConfig: DockerConfig = {
  socketPath:              DOCKER_SOCKET,
  network:                 DEFAULT_NETWORK,
  registry:                DEFAULT_REGISTRY,
  containerTtlSeconds:     CONTAINER_TTL_SECONDS,
  killGraceSeconds:        CONTAINER_KILL_GRACE_SECONDS,
  memoryLimit:             CONTAINER_MEMORY_LIMIT,
  cpuLimit:                CONTAINER_CPU_LIMIT,
  maxConcurrentContainers: MAX_CONCURRENT_CONTAINERS,
  hostPortRangeStart:      HOST_PORT_RANGE_START,
  hostPortRangeEnd:        HOST_PORT_RANGE_END,
  labsDomain:              DOCKER_LABS_DOMAIN,
};

export default dockerConfig;

