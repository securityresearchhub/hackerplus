/**
 * HackerPlus Lab Session API Server
 * Runs on port 3001 (Vite frontend proxies /api → here)
 */
import express from 'express';
import cors from 'cors';
import { labRouter } from './routes/lab.routes.js';
import { startWatchdog } from './watchdog/sessionWatchdog.js';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'HackerPlus Lab Session API', version: '1.0.0' });
});

// Lab session routes
app.use('/api/lab', labRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n[HackerPlus API] Lab Session Server running on http://localhost:${PORT}`);
  console.log(`[HackerPlus API] Health check: http://localhost:${PORT}/api/health\n`);
});

// Start background watchdog
startWatchdog();
