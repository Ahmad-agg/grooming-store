import { Router } from 'express';

export const health = Router();


health.get('/api/healthz', (req, res) => {
  res.status(200).json({
    ok: true,
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});