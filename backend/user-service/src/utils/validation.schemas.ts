import Joi from 'joi';

/**
 * Joi schemas — single source of truth for request shape validation.
 *
 * All schemas use `convert: true` (the default) so emails are lowercased and
 * trimmed values are normalized before reaching controllers.
 */

const emailSchema = Joi.string()
  .email({ minDomainSegments: 2 })
  .lowercase()
  .max(255)
  .trim()
  .required();

const passwordRulesMessage =
  'Password must be at least 8 characters with one uppercase letter, one number, and one special character';

const passwordSchema = Joi.string()
  .min(8)
  .max(128)
  .pattern(/[A-Z]/, { name: 'uppercase' })
  .pattern(/\d/, { name: 'digit' })
  .pattern(/[^A-Za-z0-9]/, { name: 'special' })
  .required()
  .messages({
    'string.min': passwordRulesMessage,
    'string.pattern.name': passwordRulesMessage,
  });

export const registerSchema = Joi.object({
  email: emailSchema,
  password: passwordSchema,
  name: Joi.string().min(1).max(255).trim().optional(),
});

export const loginSchema = Joi.object({
  email: emailSchema,
  password: Joi.string().min(1).max(128).required(),
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

export const updateProfileSchema = Joi.object({
  name: Joi.string().min(1).max(255).trim().optional(),
  email: emailSchema.optional(),
}).min(1);

export const macroGoalsSchema = Joi.object({
  daily_calories: Joi.number().integer().min(1000).max(5000).required(),
  daily_protein: Joi.number().integer().min(50).max(300).required(),
  daily_carbs: Joi.number().integer().min(50).max(500).required(),
  daily_fat: Joi.number().integer().min(20).max(200).required(),
});

export const restrictionsSchema = Joi.object({
  dietary_restrictions: Joi.array().items(Joi.string().min(1).max(50)).max(20).required(),
  favorite_cuisines: Joi.array().items(Joi.string().min(1).max(50)).max(20).optional(),
});
