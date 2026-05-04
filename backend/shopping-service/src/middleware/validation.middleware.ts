import { NextFunction, Request, Response } from 'express';
import Joi from 'joi';
import { Errors } from './error.middleware';

type Source = 'body' | 'query' | 'params';

export function validate(schema: Joi.ObjectSchema, source: Source = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const details = error.details.map((d) => ({
        field: d.path.join('.'),
        message: d.message,
      }));
      return next(Errors.validation(details));
    }

    // Write validated & coerced value back so controllers see clean data
    (req as unknown as Record<string, unknown>)[source] = value;
    next();
  };
}
