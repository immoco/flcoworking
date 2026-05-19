import { ZodError } from 'zod';

export default function validateBody(schema) {
  return (req, res, next) => {
    const parseResult = schema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Validation failed', issues: parseResult.error.errors });
    }
    req.validatedBody = parseResult.data;
    next();
  };
}
