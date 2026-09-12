import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth.js';
import * as projectsController from './projects.controller.js';

export const projectsRouter = Router();

projectsRouter.use(requireAuth);
projectsRouter.get('/', projectsController.getProjects);
