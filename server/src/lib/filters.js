import { z } from 'zod';

const emptyToUndef = (value) => {
  if (value === undefined || value === null || value === '' || value === 'all') {
    return undefined;
  }
  return value;
};

export const filterQuerySchema = z.object({
  projectId: z.string().optional().transform(emptyToUndef),
  status: z
    .string()
    .optional()
    .transform(emptyToUndef)
    .pipe(z.enum(['passed', 'failed', 'running']).optional()),
  from: z.string().optional().transform(emptyToUndef),
  to: z.string().optional().transform(emptyToUndef),
});

export const runListQuerySchema = filterQuerySchema.extend({
  q: z.string().optional().transform(emptyToUndef),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
  sort: z.enum(['startedAt', 'durationMs', 'status', 'code']).default('startedAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export const runWhere = ({ projectId, from, to, status }) => {
  const where = {};

  if (status) where.status = status;

  if (from || to) {
    where.startedAt = {};
    if (from) {
      const start = new Date(from);
      if (!Number.isNaN(start.getTime())) where.startedAt.gte = start;
    }
    if (to) {
      const end = new Date(to);
      if (!Number.isNaN(end.getTime())) where.startedAt.lte = end;
    }
  }

  if (projectId) {
    where.plan = { projectId };
  }

  return where;
};
