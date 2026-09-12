import { apiRequest, toQuery } from './client';

export const fetchProjects = () => apiRequest('/api/projects');

export const fetchSummary = (filters) =>
  apiRequest(`/api/metrics/summary${toQuery(filters)}`);

export const fetchRunsOverTime = (filters) =>
  apiRequest(`/api/metrics/runs-over-time${toQuery(filters)}`);

export const fetchStatusBreakdown = (filters) =>
  apiRequest(`/api/metrics/status-breakdown${toQuery(filters)}`);

export const fetchRuns = (filters) => apiRequest(`/api/runs${toQuery(filters)}`);

export const fetchRun = (id) => apiRequest(`/api/runs/${id}`);

export const createSampleRun = (projectId) =>
  apiRequest('/api/runs/sample', {
    method: 'POST',
    body: JSON.stringify(projectId ? { projectId } : {}),
  });
