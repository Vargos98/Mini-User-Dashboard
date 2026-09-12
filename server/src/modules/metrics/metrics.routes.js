import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/requireAuth.js';
import { filterQuerySchema } from '../../lib/filters.js';
import * as metricsController from './metrics.controller.js';

export const metricsRouter = Router();

metricsRouter.use(requireAuth);
metricsRouter.get('/summary', validate(filterQuerySchema, 'query'), metricsController.getSummary);
metricsRouter.get(
  '/runs-over-time',
  validate(filterQuerySchema, 'query'),
  metricsController.getRunsOverTime
);
metricsRouter.get(
  '/status-breakdown',
  validate(filterQuerySchema, 'query'),
  metricsController.getStatusBreakdown
);
