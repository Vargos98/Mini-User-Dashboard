import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../lib/prisma.js';
import { HttpError } from '../../lib/httpError.js';

const COOKIE_NAME = 'runboard_token';
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export const cookieName = COOKIE_NAME;

export const getCookieOptions = () => {
  const crossSite = process.env.CROSS_SITE_COOKIES === 'true';
  return {
    httpOnly: true,
    sameSite: crossSite ? 'none' : 'lax',
    secure: crossSite || process.env.NODE_ENV === 'production',
    maxAge: MAX_AGE_MS,
    path: '/',
  };
};

const publicUser = (user) => ({
  id: user.id,
  email: user.email,
  name: user.name,
});

export const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    throw new HttpError(401, 'Invalid email or password');
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    throw new HttpError(401, 'Invalid email or password');
  }

  const token = jwt.sign(
    { sub: user.id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return { token, user: publicUser(user) };
};

export const getById = async (id) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new HttpError(401, 'Sign in required');
  }
  return publicUser(user);
};
