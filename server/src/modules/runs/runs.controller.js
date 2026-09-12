import { asyncHandler } from '../../lib/httpError.js';
import * as runsService from './runs.service.js';

export const getRuns = asyncHandler(async (req, res) => {
  const payload = await runsService.listRuns(req.validated);
  res.json(payload);
});

export const getRun = asyncHandler(async (req, res) => {
  const payload = await runsService.getRunById(req.params.id);
  res.json(payload);
});

export const postSampleRun = asyncHandler(async (req, res) => {
  const run = await runsService.createSampleRun({
    projectId: req.validated?.projectId,
    triggeredBy: req.user?.name,
  });
  res.status(201).json({ run });
});
