import { prisma } from '../../lib/prisma.js';

export const listProjects = async () => {
  const projects = await prisma.project.findMany({
    orderBy: { key: 'asc' },
    include: {
      plans: {
        include: {
          _count: { select: { runs: true } },
          runs: {
            orderBy: { startedAt: 'desc' },
            take: 1,
            select: { startedAt: true, status: true, code: true },
          },
        },
      },
    },
  });

  return projects.map((project) => {
    const runCount = project.plans.reduce((sum, plan) => sum + plan._count.runs, 0);
    const latest = project.plans
      .flatMap((plan) => plan.runs)
      .sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt))[0] || null;

    return {
      id: project.id,
      name: project.name,
      key: project.key,
      planCount: project.plans.length,
      runCount,
      lastRun: latest,
    };
  });
};
