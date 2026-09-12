import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/requireAuth.js';
import { runListQuerySchema } from '../../lib/filters.js';
import * as runsController from './runs.controller.js';

export const runsRouter = Router();

const sampleSchema = z.object({
  projectId: z.string().optional(),
});

runsRouter.use(requireAuth);
runsRouter.get('/', validate(runListQuerySchema, 'query'), runsController.getRuns);
runsRouter.post('/sample', validate(sampleSchema), runsController.postSampleRun);
runsRouter.get('/:id', runsController.getRun);
