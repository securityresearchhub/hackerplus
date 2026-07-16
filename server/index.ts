/**
 * HackerPlus Lab Session API Server
 * Runs on port 3001 (Vite frontend proxies /api → here)
 * LAB-002: Added system routes + Docker startup check.
 */
import express from 'express';
import cors from 'cors';
import { labRouter } from './routes/lab.routes.js';
import { systemRouter } from './routes/system.routes.js';
import { startWatchdog } from './watchdog/sessionWatchdog.js';
import { DockerService } from './services/dockerService.js';
import { LAB_PROVIDER, SERVER_PORT, CORS_ORIGIN } from './config/env.js';
import { DockerProvider } from './providers/dockerProvider.js';

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────

app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────────

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'HackerPlus Lab Session API', version: '1.0.0' });
});

// Lab session lifecycle
app.use('/api/lab', labRouter);

// System status (Docker diagnostics)
app.use('/api/system', systemRouter);

// DELETE /containers/:id (direct endpoint support)
app.delete('/containers/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await DockerProvider.stopLab(id);
    res.json({ success: true, message: `Container ${id} stopped and removed` });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete container' });
  }
});

// 404 fallback
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

// ── Docker startup check ──────────────────────────────────────────────────────

/**
 * Verifies Docker connectivity at server boot.
 * Only runs when LAB_PROVIDER=docker. Never crashes the server.
 * Logs Docker version and ensures the lab network exists.
 */
async function runDockerStartup(): Promise<void> {
  if (LAB_PROVIDER !== 'docker') {
    console.log('[DockerStartup] Skipped — LAB_PROVIDER=mock. No Docker checks needed.');
    return;
  }

  console.log('[DockerStartup] Verifying Docker daemon connectivity...');

  const reachable = await DockerService.ping();
  if (!reachable) {
    console.warn(
      '[DockerStartup] ⚠  Docker daemon is unreachable. ' +
      'Lab provisioning will fail until Docker is available. ' +
      'Check DOCKER_HOST or verify the Docker socket path.',
    );
    return;
  }

  const version = await DockerService.version();
  console.log(`[DockerStartup] ✓ Docker daemon connected — Engine version: ${version}`);

  const networkReady = await DockerService.createNetworkIfMissing();
  if (networkReady) {
    console.log('[DockerStartup] ✓ Lab network verified.');
  } else {
    console.warn('[DockerStartup] ⚠  Lab network could not be confirmed. Provisioning may fail.');
  }
}

// ── Start server ──────────────────────────────────────────────────────────────

app.listen(SERVER_PORT, () => {
  console.log(`\n[HackerPlus API] Lab Session Server → http://localhost:${SERVER_PORT}`);
  console.log(`[HackerPlus API] Health:         GET http://localhost:${SERVER_PORT}/api/health`);
  console.log(`[HackerPlus API] Docker status:  GET http://localhost:${SERVER_PORT}/api/system/docker\n`);

  // Fire-and-forget: non-crashing Docker startup diagnostics
  runDockerStartup().catch((err) =>
    console.error('[DockerStartup] Unexpected error during startup check:', err),
  );
});

// Start background session watchdog
startWatchdog();

