import { HttpError } from '../lib/httpError.js';

export const validate = (schema, source = 'body') => (req, res, next) => {
  const parsed = schema.safeParse(req[source]);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message || 'Invalid request';
    next(new HttpError(400, message));
    return;
  }

  req.validated = parsed.data;
  next();
};
