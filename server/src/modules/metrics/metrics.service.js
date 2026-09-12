import { prisma } from '../../lib/prisma.js';
import { runWhere } from '../../lib/filters.js';

const startOfDay = (value) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

const isoDay = (value) => startOfDay(value).toISOString().slice(0, 10);

const addDays = (value, amount) => {
  const date = new Date(value);
  date.setDate(date.getDate() + amount);
  return date;
};

const bucketMode = (from, to) => {
  const span = new Date(to).getTime() - new Date(from).getTime();
  return span > 45 * 24 * 60 * 60 * 1000 ? 'week' : 'day';
};

const bucketKey = (date, mode) => {
  const start = startOfDay(date);
  if (mode === 'week') {
    start.setDate(start.getDate() - start.getDay());
  }
  return isoDay(start);
};

const fillKeys = (from, to, mode) => {
  const keys = [];
  let cursor = startOfDay(from);
  const end = startOfDay(to);
  const step = mode === 'week' ? 7 : 1;
  while (cursor <= end) {
    keys.push(bucketKey(cursor, mode));
    cursor = addDays(cursor, step);
  }
  return [...new Set(keys)];
};

const defaultRange = () => {
  const to = new Date();
  const from = addDays(to, -30);
  return { from, to };
};

export const getSummary = async (filters) => {
  const where = runWhere(filters);

  const [totalRuns, failedRuns, durationAgg, resultGroups] = await Promise.all([
    prisma.testRun.count({ where }),
    prisma.testRun.count({ where: { ...where, status: 'failed' } }),
    prisma.testRun.aggregate({
      where: { ...where, durationMs: { not: null } },
      _avg: { durationMs: true },
    }),
    prisma.testCaseResult.groupBy({
      by: ['status'],
      where: { run: where },
      _count: { _all: true },
    }),
  ]);

  const resultCounts = { passed: 0, failed: 0, skipped: 0 };
  for (const row of resultGroups) {
    if (resultCounts[row.status] !== undefined) {
      resultCounts[row.status] = row._count._all;
    }
  }

  const totalCases = resultCounts.passed + resultCounts.failed + resultCounts.skipped;
  const passRate = totalCases === 0 ? 0 : (resultCounts.passed / totalCases) * 100;

  return {
    totalRuns,
    failedRuns,
    passRate: Math.round(passRate * 10) / 10,
    avgDurationMs: Math.round(durationAgg._avg.durationMs || 0),
    totalCases,
    resultCounts,
  };
};

export const getRunsOverTime = async (filters) => {
  const { from, to } = filters.from && filters.to
    ? { from: new Date(filters.from), to: new Date(filters.to) }
    : defaultRange();
  const mode = bucketMode(from, to);
  const keys = fillKeys(from, to, mode);
  const where = runWhere(filters);

  const runs = await prisma.testRun.findMany({
    where,
    select: { startedAt: true, status: true, durationMs: true },
    orderBy: { startedAt: 'asc' },
  });

  const buckets = Object.fromEntries(
    keys.map((key) => [
      key,
      {
        date: key,
        passed: 0,
        failed: 0,
        running: 0,
        total: 0,
        durationSum: 0,
        durationCount: 0,
      },
    ])
  );

  for (const run of runs) {
    const key = bucketKey(run.startedAt, mode);
    if (!buckets[key]) continue;
    buckets[key].total += 1;
    if (buckets[key][run.status] !== undefined) {
      buckets[key][run.status] += 1;
    }
    if (run.durationMs != null) {
      buckets[key].durationSum += run.durationMs;
      buckets[key].durationCount += 1;
    }
  }

  return {
    mode,
    series: keys.map((key) => {
      const bucket = buckets[key];
      const completed = bucket.passed + bucket.failed;
      return {
        date: bucket.date,
        passed: bucket.passed,
        failed: bucket.failed,
        running: bucket.running,
        total: bucket.total,
        passRate: completed === 0 ? 0 : Math.round((bucket.passed / completed) * 1000) / 10,
        avgDurationMs:
          bucket.durationCount === 0 ? 0 : Math.round(bucket.durationSum / bucket.durationCount),
      };
    }),
  };
};

export const getStatusBreakdown = async (filters) => {
  const { from, to } = filters.from && filters.to
    ? { from: new Date(filters.from), to: new Date(filters.to) }
    : defaultRange();
  const mode = bucketMode(from, to);
  const keys = fillKeys(from, to, mode);
  const where = runWhere(filters);

  const results = await prisma.testCaseResult.findMany({
    where: { run: where },
    select: {
      status: true,
      run: { select: { startedAt: true } },
    },
  });

  const totals = { passed: 0, failed: 0, skipped: 0 };
  const buckets = Object.fromEntries(
    keys.map((key) => [key, { date: key, passed: 0, failed: 0, skipped: 0 }])
  );

  for (const result of results) {
    if (totals[result.status] !== undefined) {
      totals[result.status] += 1;
    }
    const key = bucketKey(result.run.startedAt, mode);
    if (buckets[key] && buckets[key][result.status] !== undefined) {
      buckets[key][result.status] += 1;
    }
  }

  return { mode, totals, series: keys.map((key) => buckets[key]) };
};
