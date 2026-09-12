import { asyncHandler } from '../../lib/httpError.js';
import * as projectsService from './projects.service.js';

export const getProjects = asyncHandler(async (req, res) => {
  const projects = await projectsService.listProjects();
  res.json({ projects });
});
