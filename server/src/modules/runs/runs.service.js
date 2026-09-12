import { prisma } from '../../lib/prisma.js';
import { HttpError } from '../../lib/httpError.js';
import { runWhere } from '../../lib/filters.js';

const CASE_BANK = [
  'Checkout with saved card',
  'Email + password login',
  'Health endpoint 200',
  'Refund full capture',
  'Refresh token rotation',
  'Tenant isolation header',
  'Webhook signature verify',
  'Empty filter returns []',
];

const runInclude = {
  plan: { include: { project: true } },
  _count: { select: { results: true } },
};

const serializeRun = (run, withResults = false) => ({
  id: run.id,
  code: run.code,
  status: run.status,
  startedAt: run.startedAt,
  durationMs: run.durationMs,
  triggeredBy: run.triggeredBy,
  caseCount: run._count?.results ?? run.results?.length ?? 0,
  plan: {
    id: run.plan.id,
    name: run.plan.name,
  },
  project: {
    id: run.plan.project.id,
    name: run.plan.project.name,
    key: run.plan.project.key,
  },
  results: withResults
    ? (run.results || []).map((result) => ({
        id: result.id,
        name: result.name,
        status: result.status,
        durationMs: result.durationMs,
      }))
    : undefined,
});

export const listRuns = async (query) => {
  const { q, page, pageSize, sort, order, ...filters } = query;
  const where = runWhere(filters);

  if (q) {
    where.OR = [
      { code: { contains: q } },
      { triggeredBy: { contains: q } },
      { plan: { name: { contains: q } } },
      { plan: { project: { name: { contains: q } } } },
      { plan: { project: { key: { contains: q } } } },
    ];
  }

  const [total, runs] = await Promise.all([
    prisma.testRun.count({ where }),
    prisma.testRun.findMany({
      where,
      include: runInclude,
      orderBy: { [sort]: order },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return {
    runs: runs.map((run) => serializeRun(run)),
    total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  };
};

export const getRunById = async (id) => {
  const run = await prisma.testRun.findUnique({
    where: { id },
    include: {
      ...runInclude,
      results: { orderBy: { name: 'asc' } },
    },
  });

  if (!run) {
    throw new HttpError(404, 'Run not found');
  }

  const totals = { passed: 0, failed: 0, skipped: 0 };
  for (const result of run.results) {
    if (totals[result.status] !== undefined) totals[result.status] += 1;
  }

  return {
    run: serializeRun(run, true),
    totals,
  };
};

export const createSampleRun = async ({ projectId, triggeredBy }) => {
  const project = projectId
    ? await prisma.project.findUnique({
        where: { id: projectId },
        include: { plans: true },
      })
    : await prisma.project.findFirst({
        include: { plans: true },
        orderBy: { key: 'asc' },
      });

  if (!project || project.plans.length === 0) {
    throw new HttpError(400, 'No project available to record a run');
  }

  const plan = project.plans[Math.floor(Math.random() * project.plans.length)];
  const failed = Math.random() < 0.28;
  const results = CASE_BANK.slice(0, 6).map((name, index) => ({
    name,
    status: failed && index === 0 ? 'failed' : Math.random() < 0.1 ? 'skipped' : 'passed',
    durationMs: 500 + Math.floor(Math.random() * 9000),
  }));
  const status = results.some((item) => item.status === 'failed') ? 'failed' : 'passed';
  const durationMs = results.reduce((sum, item) => sum + item.durationMs, 0) + 600;
  const count = await prisma.testRun.count();
  const code = `${project.key}-${String(1001 + count).padStart(4, '0')}`;

  const run = await prisma.testRun.create({
    data: {
      code,
      planId: plan.id,
      status,
      startedAt: new Date(),
      durationMs,
      triggeredBy: triggeredBy || 'Asha Rao',
      results: { create: results },
    },
    include: {
      ...runInclude,
      results: true,
    },
  });

  return serializeRun(run, true);
};
