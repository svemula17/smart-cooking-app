import Joi from 'joi';
import { CUISINE_TYPES } from '../types';

const uuidSchema = Joi.string().uuid().required();

const stepSchema = Joi.object({
  step_number: Joi.number().integer().min(1).required(),
  instruction: Joi.string().min(1).max(2000).required(),
  time_minutes: Joi.number().integer().min(0).max(600).optional(),
});

const ingredientSchema = Joi.object({
  ingredient_name: Joi.string().min(1).max(255).required(),
  quantity: Joi.number().positive().max(10_000).required(),
  unit: Joi.string().min(1).max(50).required(),
  notes: Joi.string().max(500).allow('', null).optional(),
});

export const createRecipeSchema = Joi.object({
  name: Joi.string().min(3).max(255).trim().required(),
  cuisine_type: Joi.string()
    .valid(...CUISINE_TYPES)
    .required(),
  difficulty: Joi.string().valid('Easy', 'Medium', 'Hard').required(),
  prep_time_minutes: Joi.number().integer().min(1).max(300).required(),
  cook_time_minutes: Joi.number().integer().min(1).max(300).required(),
  servings: Joi.number().integer().min(1).max(20).required(),
  instructions: Joi.array().items(stepSchema).min(1).required(),
  ingredients: Joi.array().items(ingredientSchema).min(1).required(),
  image_url: Joi.string().uri().max(500).allow(null).optional(),
  nutrition: Joi.object({
    calories: Joi.number().integer().min(0).max(5000).required(),
    protein_g: Joi.number().min(0).max(500).required(),
    carbs_g: Joi.number().min(0).max(1000).required(),
    fat_g: Joi.number().min(0).max(500).required(),
    fiber_g: Joi.number().min(0).max(200).default(0),
    sodium_mg: Joi.number().min(0).max(20000).default(0),
  }).optional(),
});

export const updateRecipeSchema = Joi.object({
  name: Joi.string().min(3).max(255).trim().optional(),
  cuisine_type: Joi.string().valid(...CUISINE_TYPES).optional(),
  difficulty: Joi.string().valid('Easy', 'Medium', 'Hard').optional(),
  prep_time_minutes: Joi.number().integer().min(1).max(300).optional(),
  cook_time_minutes: Joi.number().integer().min(1).max(300).optional(),
  servings: Joi.number().integer().min(1).max(20).optional(),
  instructions: Joi.array().items(stepSchema).min(1).optional(),
  image_url: Joi.string().uri().max(500).allow(null).optional(),
}).min(1);

export const recipeIdParamSchema = Joi.object({ id: uuidSchema });

export const cuisineParamSchema = Joi.object({
  cuisineType: Joi.string().valid(...CUISINE_TYPES).required(),
});

export const listQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  cuisine_type: Joi.string().valid(...CUISINE_TYPES).optional(),
  difficulty: Joi.string().valid('Easy', 'Medium', 'Hard').optional(),
  max_cook_time: Joi.number().integer().min(1).max(600).optional(),
});

export const searchQuerySchema = Joi.object({
  q: Joi.string().min(1).max(200).optional(),
  cuisine_type: Joi.string().valid(...CUISINE_TYPES).optional(),
  difficulty: Joi.string().valid('Easy', 'Medium', 'Hard').optional(),
  max_cook_time: Joi.number().integer().min(1).max(600).optional(),
  min_protein: Joi.number().min(0).max(500).optional(),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
});

export const rateRecipeSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().max(2000).allow('', null).optional(),
});

export const macroMatchSchema = Joi.object({
  remaining_calories: Joi.number().min(0).max(5000).required(),
  remaining_protein: Joi.number().min(0).max(500).required(),
  remaining_carbs: Joi.number().min(0).max(1000).required(),
  remaining_fat: Joi.number().min(0).max(500).required(),
  limit: Joi.number().integer().min(1).max(50).optional(),
});
