/**
 * Lab Session API Routes — /api/lab
 */
import { Router, type Request, type Response } from 'express';
import { LabOrchestrator } from '../services/labOrchestrator.js';
import { LabRegistry } from '../services/labRegistry.js';

export const labRouter = Router();

/**
 * POST /api/lab/start
 * Creates a new isolated lab session and begins async container provisioning.
 */
labRouter.post('/start', async (req: Request, res: Response) => {
  const { labId, userId } = req.body as { labId?: string; userId?: string };

  if (!labId || !userId) {
    res.status(400).json({ error: 'labId and userId are required.' });
    return;
  }

  // Check if user already has a running session for this lab
  const existing = LabRegistry.getActiveForUser(userId, labId);
  if (existing) {
    res.status(200).json({
      labSessionId: existing.labSessionId,
      status: existing.status,
      labUrl: existing.labUrl,
      expiresAt: existing.expiresAt,
      pollUrl: `/api/lab/${existing.labSessionId}`,
    });
    return;
  }

  const labSessionId = await LabOrchestrator.startSession(labId, userId);

  res.status(202).json({
    labSessionId,
    status: 'provisioning',
    labUrl: null,
    pollUrl: `/api/lab/${labSessionId}`,
  });
});

/**
 * GET /api/lab/:labSessionId
 * Polls the status of a lab session. Frontend polls until status === 'running'.
 */
labRouter.get('/:labSessionId', (req: Request, res: Response) => {
  const { labSessionId } = req.params;
  const session = LabRegistry.get(labSessionId);

  if (!session) {
    res.status(404).json({ error: 'Lab session not found.' });
    return;
  }

  res.json({
    labSessionId: session.labSessionId,
    labId: session.labId,
    status: session.status,
    labUrl: session.labUrl,
    expiresAt: session.expiresAt,
    startedAt: session.startedAt,
  });
});

/**
 * POST /api/lab/:labSessionId/stop
 * Terminates a lab session and releases the container.
 */
labRouter.post('/:labSessionId/stop', async (req: Request, res: Response) => {
  const { labSessionId } = req.params;
  const session = LabRegistry.get(labSessionId);

  if (!session) {
    res.status(404).json({ error: 'Lab session not found.' });
    return;
  }

  await LabOrchestrator.stopSession(labSessionId);

  res.json({ labSessionId, status: 'terminated' });
});

/**
 * POST /api/lab/:labSessionId/flag
 * Server-side flag validation (Phase 4 — currently returns not implemented).
 */
labRouter.post('/:labSessionId/flag', (req: Request, res: Response) => {
  res.status(501).json({ error: 'Server-side flag validation not yet implemented. Use client-side FlagEngine.' });
});
