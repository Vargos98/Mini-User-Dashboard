import { asyncHandler } from '../../lib/httpError.js';
import * as metricsService from './metrics.service.js';

export const getSummary = asyncHandler(async (req, res) => {
  const summary = await metricsService.getSummary(req.validated);
  res.json(summary);
});

export const getRunsOverTime = asyncHandler(async (req, res) => {
  const payload = await metricsService.getRunsOverTime(req.validated);
  res.json(payload);
});

export const getStatusBreakdown = asyncHandler(async (req, res) => {
  const payload = await metricsService.getStatusBreakdown(req.validated);
  res.json(payload);
});
