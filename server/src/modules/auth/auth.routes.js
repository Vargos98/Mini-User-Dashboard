import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/requireAuth.js';
import * as authController from './auth.controller.js';

export const authRouter = Router();

const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

authRouter.post('/login', validate(loginSchema), authController.postLogin);
authRouter.post('/logout', authController.postLogout);
authRouter.get('/me', requireAuth, authController.getSession);
