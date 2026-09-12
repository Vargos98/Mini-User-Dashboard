import jwt from 'jsonwebtoken';
import { HttpError } from '../lib/httpError.js';

export const requireAuth = (req, res, next) => {
  const token = req.cookies?.runboard_token;
  if (!token) {
    next(new HttpError(401, 'Sign in required'));
    return;
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    next(new HttpError(401, 'Session expired. Please sign in again.'));
  }
};
