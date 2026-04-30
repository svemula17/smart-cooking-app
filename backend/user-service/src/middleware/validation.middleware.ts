import type { Request, Response, NextFunction } from 'express';
import type { ObjectSchema } from 'joi';

type Source = 'body' | 'query' | 'params';

/**
 * Build middleware that validates `req[source]` against a Joi schema.
 * On success, the parsed (and stripped) value replaces `req[source]`.
 * On failure, responds 400 with the Joi error details.
 */
export function validate(schema: ObjectSchema, source: Source = 'body') {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { value, error } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      res.status(400).json({
        error: 'validation_error',
        details: error.details.map((d) => ({ path: d.path.join('.'), message: d.message })),
      });
      return;
    }

    (req as unknown as Record<Source, unknown>)[source] = value;
    next();
  };
}
