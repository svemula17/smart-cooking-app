import type { NextFunction, Request, Response } from 'express';
import type { ObjectSchema } from 'joi';
import { Errors } from './error.middleware';

type Source = 'body' | 'query' | 'params';

/**
 * Validate `req[source]` against a Joi schema. On success, the parsed
 * (stripped, type-coerced) value replaces `req[source]`.
 */
export function validate(schema: ObjectSchema, source: Source = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const { value, error } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      const details = error.details.map((d) => ({
        field: d.path.join('.'),
        message: d.message,
      }));
      return next(Errors.validationError(details));
    }

    (req as unknown as Record<Source, unknown>)[source] = value;
    next();
  };
}
