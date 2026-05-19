import { ZodError } from 'zod';

export default function errorHandler(err, req, res, next) {
  if (err instanceof ZodError) {
    return res.status(400).json({ error: 'Validation failed', issues: err.errors });
  }
  console.error(err);
  return res.status(500).json({ error: 'Internal server error' });
}
