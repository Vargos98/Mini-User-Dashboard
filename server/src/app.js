import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { prisma } from './lib/prisma.js';
import { asyncHandler } from './lib/httpError.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { projectsRouter } from './modules/projects/projects.routes.js';
import { metricsRouter } from './modules/metrics/metrics.routes.js';
import { runsRouter } from './modules/runs/runs.routes.js';

export const createApp = () => {
  const app = express();
  app.set('trust proxy', 1);

  const origins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim());

  app.use(
    cors({
      origin: origins,
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(cookieParser());

  app.get('/', (req, res) => {
    res.json({
      name: 'Runboard API',
      ok: true,
      docs: {
        health: '/api/health',
        login: 'POST /api/auth/login',
        summary: 'GET /api/metrics/summary',
        runs: 'GET /api/runs',
      },
      site: process.env.CLIENT_ORIGIN || null,
    });
  });

  app.get(
    '/api/health',
    asyncHandler(async (req, res) => {
      await prisma.$queryRaw`SELECT 1`;
      res.json({ ok: true });
    })
  );

  app.use('/api/auth', authRouter);
  app.use('/api/projects', projectsRouter);
  app.use('/api/metrics', metricsRouter);
  app.use('/api/runs', runsRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
};
