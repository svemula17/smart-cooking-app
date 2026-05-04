import { Router } from 'express';
import {
  checkAvailability,
  checkItem,
  completeList,
  deleteList,
  generateList,
  getList,
  getLists,
  getNearbyStores,
} from '../controllers/shopping.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  availabilityQuerySchema,
  checkItemSchema,
  generateListSchema,
  itemParamSchema,
  listIdParamSchema,
  listQuerySchema,
  nearbyStoresQuerySchema,
} from '../utils/validation.schemas';

export const shoppingRouter = Router();

// All routes require authentication
shoppingRouter.use(authenticate);

/**
 * POST /shopping/lists/generate
 * Build a shopping list from one or more recipe IDs.
 */
shoppingRouter.post(
  '/lists/generate',
  validate(generateListSchema, 'body'),
  generateList,
);

/**
 * GET /shopping/lists
 * List all shopping lists for the authenticated user.
 */
shoppingRouter.get(
  '/lists',
  validate(listQuerySchema, 'query'),
  getLists,
);

/**
 * GET /shopping/lists/:id
 * Get a single shopping list with items (sorted by aisle).
 */
shoppingRouter.get(
  '/lists/:id',
  validate(listIdParamSchema, 'params'),
  getList,
);

/**
 * PATCH /shopping/lists/:id/items/:itemId/check
 * Check or uncheck a shopping item.
 */
shoppingRouter.patch(
  '/lists/:id/items/:itemId/check',
  validate(itemParamSchema, 'params'),
  validate(checkItemSchema, 'body'),
  checkItem,
);

/**
 * POST /shopping/lists/:id/complete
 * Mark a list as completed.
 */
shoppingRouter.post(
  '/lists/:id/complete',
  validate(listIdParamSchema, 'params'),
  completeList,
);

/**
 * DELETE /shopping/lists/:id
 * Delete a shopping list and all its items.
 */
shoppingRouter.delete(
  '/lists/:id',
  validate(listIdParamSchema, 'params'),
  deleteList,
);

/**
 * GET /shopping/availability
 * Check product availability on Instacart/Walmart.
 * Query: ingredients=salt,butter&store=all
 */
shoppingRouter.get(
  '/availability',
  validate(availabilityQuerySchema, 'query'),
  checkAvailability,
);

/**
 * GET /shopping/stores/nearby
 * Find nearby grocery stores via Google Places.
 * Query: lat=37.7749&lng=-122.4194&radius_km=5
 */
shoppingRouter.get(
  '/stores/nearby',
  validate(nearbyStoresQuerySchema, 'query'),
  getNearbyStores,
);
