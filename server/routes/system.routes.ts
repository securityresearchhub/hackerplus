/**
 * system.routes.ts
 * System status API endpoints — /api/system
 *
 * GET /api/system/docker
 *   Returns Docker Engine connectivity, version, image/container counts, and
 *   the configured lab network name.
 *
 *   Response when LAB_PROVIDER=docker and daemon is reachable (200):
 *     { connected: true, dockerVersion: "27.x.x", containers: 0, images: 3, network: "hackerplus_labs" }
 *
 *   Response when daemon is unreachable (503):
 *     { connected: false, dockerVersion: null, containers: 0, images: 0, network: "...", error: "..." }
 *
 *   Response when LAB_PROVIDER≠docker (200 — informational):
 *     { connected: false, dockerVersion: null, ..., reason: "LAB_PROVIDER=mock ..." }
 *
 * LAB-002
 */
import { Router, type Request, type Response } from 'express';
import { DockerService } from '../services/dockerService.js';
import { ContainerService } from '../services/containerService.js';
import { DockerProvider } from '../providers/dockerProvider.js';
import { LAB_PROVIDER } from '../config/env.js';
import { dockerConfig } from '../config/docker.js';

export const systemRouter = Router();

/**
 * GET /api/system/docker
 */
systemRouter.get('/docker', async (_req: Request, res: Response) => {
  // When mock provider is active, Docker is intentionally bypassed
  if (LAB_PROVIDER !== 'docker') {
    res.status(200).json({
      connected: false,
      dockerVersion: null,
      containers: 0,
      images: 0,
      network: dockerConfig.network,
      reason: `LAB_PROVIDER is set to "${LAB_PROVIDER}". Set LAB_PROVIDER=docker to enable Docker integration.`,
    });
    return;
  }

  try {
    const health = await DockerService.healthCheck();
    const statusCode = health.connected ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (err) {
    // Should never reach here — DockerService.healthCheck() never throws
    console.error('[SystemRoutes] Unexpected error in /api/system/docker:', err);
    res.status(503).json({
      connected: false,
      dockerVersion: null,
      containers: 0,
      images: 0,
      network: dockerConfig.network,
      error: 'Unexpected internal error while checking Docker status.',
    });
  }
});

/**
 * GET /api/system/containers
 * Returns all active HackerPlus containers.
 */
systemRouter.get('/containers', async (_req: Request, res: Response) => {
  try {
    const list = await ContainerService.listRunningContainers();
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to list containers' });
  }
});

/**
 * POST /api/system/container/test
 * Provisions one test container (nginx:alpine).
 */
systemRouter.post('/container/test', async (_req: Request, res: Response) => {
  try {
    const testSessionId = `test_${Math.random().toString(36).substring(2, 10)}`;
    const result = await DockerProvider.startLab('nginx:alpine', testSessionId);
    res.status(201).json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to start test container' });
  }
});

/**
 * DELETE /api/system/containers/:id
 * Stops and removes a container by ID.
 */
systemRouter.delete('/containers/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await DockerProvider.stopLab(id);
    res.json({ success: true, message: `Container ${id} stopped and removed` });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete container' });
  }
});

