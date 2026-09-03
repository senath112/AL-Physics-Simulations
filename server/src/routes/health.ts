import { Router, Request, Response } from 'express';
import { simulationHealthService } from '../validation/physicsValidator';

const router = Router();

/**
 * Standard server liveness probe
 */
router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    uptimeSeconds: process.uptime(),
  });
});

/**
 * Physics Simulation Health & Validation Endpoint
 * 
 * Provides one definitive HTTP status code representing overall physics simulation health:
 * - HTTP 200 (OK): All critical physics simulations healthy and validated.
 * - HTTP 503 (Service Unavailable): At least one critical simulator failed validation.
 * 
 * Serves cached periodic verification results to keep uptime monitoring lightweight and fast.
 */
router.get('/health/simulations', (req: Request, res: Response) => {
  // Allow manual forced refresh via ?refresh=true if requested
  const forceRefresh = req.query.refresh === 'true';
  const report = forceRefresh 
    ? simulationHealthService.refresh() 
    : simulationHealthService.getReport();

  if (report.status === 'healthy') {
    return res.status(200).json(report);
  } else {
    return res.status(503).json(report);
  }
});

export default router;

