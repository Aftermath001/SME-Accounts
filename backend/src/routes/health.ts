import { Router, Request, Response } from 'express';
import { successResponse } from '../utils/response';

const healthRouter = Router();

/**
 * GET /health
 * Health check endpoint for monitoring and load balancer
 */
healthRouter.get('/health', (_req: Request, res: Response): void => {
  res.status(200).json(
    successResponse({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    })
  );
});

export default healthRouter;
