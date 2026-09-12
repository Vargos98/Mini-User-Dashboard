import { asyncHandler } from '../../lib/httpError.js';
import * as authService from './auth.service.js';

export const postLogin = asyncHandler(async (req, res) => {
  const { token, user } = await authService.login(req.validated);
  res.cookie(authService.cookieName, token, authService.getCookieOptions());
  res.json({ user });
});

export const postLogout = asyncHandler(async (req, res) => {
  res.clearCookie(authService.cookieName, authService.getCookieOptions());
  res.json({ ok: true });
});

export const getSession = asyncHandler(async (req, res) => {
  const user = await authService.getById(req.user.sub);
  res.json({ user });
});
