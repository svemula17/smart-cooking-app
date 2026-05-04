import Joi from 'joi';

const uuidSchema = Joi.string().uuid().required();

export const generateListSchema = Joi.object({
  name: Joi.string().min(1).max(255).trim().required(),
  recipe_ids: Joi.array().items(Joi.string().uuid()).min(1).max(20).required(),
});

export const createListSchema = Joi.object({
  name: Joi.string().min(1).max(255).trim().required(),
});

export const listIdParamSchema = Joi.object({ id: uuidSchema });

export const itemParamSchema = Joi.object({
  id: uuidSchema,
  itemId: Joi.string().uuid().required(),
});

export const checkItemSchema = Joi.object({
  is_checked: Joi.boolean().required(),
});

export const addItemSchema = Joi.object({
  ingredient_name: Joi.string().min(1).max(255).trim().required(),
  quantity: Joi.number().positive().max(10_000).required(),
  unit: Joi.string().min(1).max(50).required(),
  notes: Joi.string().max(500).allow('', null).optional(),
});

export const availabilityQuerySchema = Joi.object({
  ingredients: Joi.string().min(1).max(2000).required(), // comma-separated
  store: Joi.string().valid('instacart', 'walmart', 'all').default('all'),
});

export const nearbyStoresQuerySchema = Joi.object({
  lat: Joi.number().min(-90).max(90).required(),
  lng: Joi.number().min(-180).max(180).required(),
  radius_km: Joi.number().min(0.1).max(50).default(5),
});

export const listQuerySchema = Joi.object({
  status: Joi.string().valid('active', 'completed').optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});
