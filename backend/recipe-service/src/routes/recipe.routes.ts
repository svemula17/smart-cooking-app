import { Router } from 'express';
import {
  createRecipe,
  deleteRecipe,
  getRecipe,
  listByCuisine,
  listRecipes,
  listReviews,
  macroMatch,
  rateRecipe,
  searchRecipes,
  updateRecipe,
} from '../controllers/recipe.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';
import { pagination } from '../middleware/pagination.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createRecipeSchema,
  cuisineParamSchema,
  listQuerySchema,
  macroMatchSchema,
  rateRecipeSchema,
  recipeIdParamSchema,
  searchQuerySchema,
  updateRecipeSchema,
} from '../utils/validation.schemas';

export const recipeRouter = Router();

// Order matters: more specific routes (search, cuisine, macro-match) must
// register before the parameterised `/:id` route so they don't match it.
recipeRouter.get('/search', validate(searchQuerySchema, 'query'), pagination, searchRecipes);
recipeRouter.get(
  '/cuisine/:cuisineType',
  validate(cuisineParamSchema, 'params'),
  pagination,
  listByCuisine,
);
recipeRouter.get('/macro-match', authenticate, validate(macroMatchSchema), macroMatch);

recipeRouter.get('/', validate(listQuerySchema, 'query'), pagination, listRecipes);
recipeRouter.post('/', authenticate, requireAdmin, validate(createRecipeSchema), createRecipe);

recipeRouter.get('/:id', validate(recipeIdParamSchema, 'params'), getRecipe);
recipeRouter.put(
  '/:id',
  authenticate,
  requireAdmin,
  validate(recipeIdParamSchema, 'params'),
  validate(updateRecipeSchema),
  updateRecipe,
);
recipeRouter.delete(
  '/:id',
  authenticate,
  requireAdmin,
  validate(recipeIdParamSchema, 'params'),
  deleteRecipe,
);

recipeRouter.post(
  '/:id/rate',
  authenticate,
  validate(recipeIdParamSchema, 'params'),
  validate(rateRecipeSchema),
  rateRecipe,
);
recipeRouter.get(
  '/:id/reviews',
  validate(recipeIdParamSchema, 'params'),
  pagination,
  listReviews,
);
