import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const mulberry32 = (seed) => () => {
  let t = (seed += 0x6d2b79f5);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const pick = (rng, list) => list[Math.floor(rng() * list.length)];

const CASE_BANK = {
  PAY: [
    'Checkout with saved card',
    'Checkout with new Visa',
    '3DS challenge path',
    'Wallet pay (Apple Pay)',
    'Refund full capture',
    'Refund partial capture',
    'Idempotent charge retry',
    'Expired authorization',
    'Currency conversion INR',
    'Webhook signature verify',
  ],
  AUTH: [
    'Email + password login',
    'SSO Google happy path',
    'SSO SAML timeout',
    'Refresh token rotation',
    'Lockout after 5 failures',
    'Password reset token TTL',
    'MFA TOTP enroll',
    'Session revoke on logout',
    'Invite existing member',
    'Role claim on JWT',
  ],
  CORE: [
    'Health endpoint 200',
    'OpenAPI contract drift',
    'Pagination cursor stable',
    'Soft-delete cascade',
    'Tenant isolation header',
    'Rate limit 429 path',
    'Migration rollback dry-run',
    'Audit log write',
    'Search fuzzy match',
    'Empty filter returns []',
  ],
};

const PROJECTS = [
  {
    key: 'PAY',
    name: 'Payments',
    plans: ['Checkout regression', 'Refunds nightly'],
  },
  {
    key: 'AUTH',
    name: 'Auth Gateway',
    plans: ['Login suite', 'SSO smoke'],
  },
  {
    key: 'CORE',
    name: 'Core API',
    plans: ['Health + contracts', 'Migration checks'],
  },
];

const TRIGGERS = ['Asha Rao', 'ci-bot', 'nightly', 'Rahul Mehta'];

const caseStatus = (rng) => {
  const n = rng();
  if (n < 0.78) return 'passed';
  if (n < 0.93) return 'failed';
  return 'skipped';
};

const runStatusWeighted = (rng, isRecent) => {
  const n = rng();
  if (isRecent && n > 0.92) return 'running';
  if (n < 0.72) return 'passed';
  return 'failed';
};

const seed = async () => {
  const email = (process.env.DEMO_EMAIL || 'analyst@runboard.dev').toLowerCase();
  const password = process.env.DEMO_PASSWORD || 'Runboard123!';
  const name = process.env.DEMO_NAME || 'Asha Rao';
  const passwordHash = await bcrypt.hash(password, 10);
  const rng = mulberry32(20260911);

  await prisma.testCaseResult.deleteMany();
  await prisma.testRun.deleteMany();
  await prisma.testPlan.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.create({
    data: { email, passwordHash, name },
  });

  const createdPlans = [];
  for (const project of PROJECTS) {
    const row = await prisma.project.create({
      data: {
        key: project.key,
        name: project.name,
        plans: {
          create: project.plans.map((planName) => ({ name: planName })),
        },
      },
      include: { plans: true },
    });
    createdPlans.push(...row.plans.map((plan) => ({ ...plan, projectKey: project.key })));
  }

  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  let seq = 1001;
  const runRows = [];

  for (let i = 0; i < 42; i += 1) {
    const daysAgo = Math.floor(rng() * rng() * 90);
    const startedAt = new Date(now - daysAgo * dayMs - Math.floor(rng() * dayMs));
    const plan = pick(rng, createdPlans);
    const isRecent = daysAgo <= 2;
    const status = runStatusWeighted(rng, isRecent);
    const code = `${plan.projectKey}-${String(seq).padStart(4, '0')}`;
    seq += 1;

    const caseNames = CASE_BANK[plan.projectKey];
    const caseCount = 4 + Math.floor(rng() * 4);
    const results =
      status === 'running'
        ? []
        : Array.from({ length: caseCount }, (_, index) => {
            const statusForCase =
              status === 'failed' && index === 0 ? 'failed' : caseStatus(rng);
            return {
              name: caseNames[index % caseNames.length],
              status: statusForCase,
              durationMs: 400 + Math.floor(rng() * 12000),
            };
          });

    const durationMs =
      status === 'running'
        ? null
        : results.reduce((sum, item) => sum + item.durationMs, 0) + 800;

    runRows.push({
      code,
      planId: plan.id,
      status,
      startedAt,
      durationMs,
      triggeredBy: pick(rng, TRIGGERS),
      results,
    });
  }

  for (const run of runRows) {
    await prisma.testRun.create({
      data: {
        code: run.code,
        planId: run.planId,
        status: run.status,
        startedAt: run.startedAt,
        durationMs: run.durationMs,
        triggeredBy: run.triggeredBy,
        results: run.results.length ? { create: run.results } : undefined,
      },
    });
  }

  const resultCount = await prisma.testCaseResult.count();
  console.log(
    `Seeded ${email} / ${password}, ${PROJECTS.length} projects, ${runRows.length} runs, ${resultCount} case results.`
  );
};

seed()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
