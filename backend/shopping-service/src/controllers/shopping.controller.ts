import { NextFunction, Request, Response } from 'express';
import { pool, withTransaction } from '../config/database';
import { cacheGet, cacheSet } from '../config/redis';
import { ShoppingItemModel } from '../models/shoppingItem.model';
import { ShoppingListModel } from '../models/shoppingList.model';
import { searchInstacart } from '../services/instacart.service';
import { findNearbyGroceryStores } from '../services/places.service';
import { searchWalmart } from '../services/walmart.service';
import type { ApiSuccess, ItemAvailability, NearbyStore, ShoppingListWithItems, StoreProduct } from '../types';
import { getAisle, sortByAisle } from '../utils/aisleOrganizer';
import { aggregateIngredients, RawIngredient } from '../utils/quantityAggregator';
import { Errors } from '../middleware/error.middleware';

// ─── Generate list from recipes ───────────────────────────────────────────────

export async function generateList(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { name, recipe_ids } = req.body as { name: string; recipe_ids: string[] };

    // Fetch ingredients for all the requested recipes (only valid UUIDs that exist)
    const ingredientRows = await pool.query<RawIngredient>(
      `SELECT ri.ingredient_name, ri.quantity, ri.unit, ri.notes
       FROM recipe_ingredients ri
       WHERE ri.recipe_id = ANY($1::uuid[])`,
      [recipe_ids],
    );

    const aggregated = aggregateIngredients(ingredientRows.rows);
    const itemsWithAisle = aggregated.map((item) => ({
      ...item,
      aisle: getAisle(item.ingredient_name),
    }));
    const sorted = sortByAisle(itemsWithAisle);

    const list = await withTransaction(async (client) => {
      const newList = await ShoppingListModel.create(client, {
        userId,
        name,
        recipeIds: recipe_ids,
      });
      const items = await ShoppingItemModel.insertMany(client, newList.id, sorted);
      return { ...newList, items };
    });

    const body: ApiSuccess<ShoppingListWithItems> = { success: true, data: list };
    res.status(201).json(body);
  } catch (err) {
    next(err);
  }
}

// ─── Get all lists for current user ──────────────────────────────────────────

export async function getLists(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { status, page, limit } = req.query as {
      status?: 'active' | 'completed';
      page: string;
      limit: string;
    };

    const { lists, total } = await ShoppingListModel.findAllByUser(userId, {
      status,
      page: parseInt(String(page), 10),
      limit: parseInt(String(limit), 10),
    });

    const body: ApiSuccess<{
      lists: typeof lists;
      pagination: { page: number; limit: number; total: number };
    }> = {
      success: true,
      data: {
        lists,
        pagination: {
          page: parseInt(String(page), 10),
          limit: parseInt(String(limit), 10),
          total,
        },
      },
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

// ─── Get a single list with items ─────────────────────────────────────────────

export async function getList(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const list = await ShoppingListModel.findById(id, userId);
    if (!list) return next(Errors.notFound('Shopping list'));

    const items = await ShoppingItemModel.findByListId(id);
    const sorted = sortByAisle(items);

    const body: ApiSuccess<ShoppingListWithItems> = {
      success: true,
      data: { ...list, items: sorted },
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

// ─── Check / uncheck an item ──────────────────────────────────────────────────

export async function checkItem(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { id, itemId } = req.params;
    const { is_checked } = req.body as { is_checked: boolean };

    // Verify the list belongs to this user
    const list = await ShoppingListModel.findById(id, userId);
    if (!list) return next(Errors.notFound('Shopping list'));

    // Verify item belongs to list
    const item = await ShoppingItemModel.findById(itemId);
    if (!item || item.list_id !== id) return next(Errors.notFound('Shopping item'));

    const updated = await ShoppingItemModel.setChecked(itemId, is_checked);
    if (!updated) return next(Errors.notFound('Shopping item'));

    const body: ApiSuccess<typeof updated> = { success: true, data: updated };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

// ─── Check availability across stores ────────────────────────────────────────

export async function checkAvailability(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { ingredients: rawIngredients, store } = req.query as {
      ingredients: string;
      store: string;
    };

    const ingredientList = rawIngredients
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 20); // cap at 20 items

    const CACHE_TTL = 3600; // 1 hour

    const results: ItemAvailability[] = await Promise.all(
      ingredientList.map(async (ingredient) => {
        const cacheKey = `avail:${store}:${ingredient.toLowerCase()}`;
        const cached = await cacheGet<ItemAvailability>(cacheKey);
        if (cached) return cached;

        let products: StoreProduct[] = [];

        if (store === 'instacart' || store === 'all') {
          const instacartProducts = await searchInstacart(ingredient);
          products = [...products, ...instacartProducts];
        }
        if (store === 'walmart' || store === 'all') {
          const walmartProducts = await searchWalmart(ingredient);
          products = [...products, ...walmartProducts];
        }

        const cheapest =
          products.length > 0
            ? products.reduce((a, b) => (a.price <= b.price ? a : b))
            : null;

        const result: ItemAvailability = { ingredient, products, cheapest };
        await cacheSet(cacheKey, result, CACHE_TTL);
        return result;
      }),
    );

    const body: ApiSuccess<{ availability: ItemAvailability[] }> = {
      success: true,
      data: { availability: results },
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

// ─── Nearby stores ────────────────────────────────────────────────────────────

export async function getNearbyStores(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { lat, lng, radius_km } = req.query as {
      lat: string;
      lng: string;
      radius_km: string;
    };

    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    const radiusNum = parseFloat(radius_km);

    const cacheKey = `stores:${latNum.toFixed(3)}:${lngNum.toFixed(3)}:${radiusNum}`;
    const cached = await cacheGet<NearbyStore[]>(cacheKey);
    if (cached) {
      const body: ApiSuccess<{ stores: NearbyStore[] }> = {
        success: true,
        data: { stores: cached },
      };
      return void res.status(200).json(body);
    }

    const stores = await findNearbyGroceryStores(latNum, lngNum, radiusNum);
    await cacheSet(cacheKey, stores, 3600);

    const body: ApiSuccess<{ stores: NearbyStore[] }> = {
      success: true,
      data: { stores },
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

// ─── Complete a list ──────────────────────────────────────────────────────────

export async function completeList(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const updated = await ShoppingListModel.complete(id, userId);
    if (!updated) return next(Errors.notFound('Shopping list (or already completed)'));

    const body: ApiSuccess<typeof updated> = { success: true, data: updated };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

// ─── Delete a list ────────────────────────────────────────────────────────────

export async function deleteList(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const deleted = await ShoppingListModel.delete(id, userId);
    if (!deleted) return next(Errors.notFound('Shopping list'));

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
