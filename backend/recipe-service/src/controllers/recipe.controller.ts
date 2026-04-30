import type { NextFunction, Request, Response } from 'express';
import { pool } from '../config/database';
import { Errors } from '../middleware/error.middleware';
import { IngredientModel } from '../models/ingredient.model';
import { RecipeModel } from '../models/recipe.model';
import { ReviewModel } from '../models/review.model';
import type {
  ApiSuccess,
  PaginatedResponse,
  Recipe,
  RecipeWithDetails,
  Review,
} from '../types';
import { rankByMacroMatch } from '../utils/macroMatcher';

/**
 * Build the full `RecipeWithDetails` shape for a single recipe by joining
 * ingredients, nutrition, and the rating summary in parallel.
 */
async function hydrateRecipe(recipe: Recipe): Promise<RecipeWithDetails> {
  const [ingredients, nutrition, summary] = await Promise.all([
    IngredientModel.findByRecipeId(recipe.id),
    RecipeModel.findNutrition(recipe.id),
    ReviewModel.getSummary(recipe.id),
  ]);
  return {
    ...recipe,
    ingredients,
    nutrition,
    average_rating: summary.average_rating,
    total_ratings: summary.total_ratings,
  };
}

/**
 * @route   GET /recipes
 * @access  public
 * @query   page, limit, cuisine_type, difficulty, max_cook_time
 * @returns 200 paginated recipe list
 */
export async function listRecipes(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { page, limit, offset } = req.pagination!;
    const { cuisine_type, difficulty, max_cook_time } = req.query as {
      cuisine_type?: string;
      difficulty?: string;
      max_cook_time?: string | number;
    };

    const { rows, total } = await RecipeModel.list(
      {
        cuisine_type,
        difficulty,
        max_cook_time: max_cook_time != null ? Number(max_cook_time) : undefined,
      },
      { limit, offset },
    );

    const body: ApiSuccess<{ recipes: Recipe[]; pagination: PaginatedResponse<Recipe>['pagination'] }> = {
      success: true,
      data: {
        recipes: rows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.max(1, Math.ceil(total / limit)),
        },
      },
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

/**
 * @route   GET /recipes/search
 * @access  public
 * @query   q, cuisine_type, difficulty, max_cook_time, min_protein, page, limit
 * @returns 200 matching recipes (paginated)
 */
export async function searchRecipes(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { page, limit, offset } = req.pagination!;
    const q = typeof req.query.q === 'string' ? req.query.q : undefined;
    const cuisine_type = typeof req.query.cuisine_type === 'string' ? req.query.cuisine_type : undefined;
    const difficulty = typeof req.query.difficulty === 'string' ? req.query.difficulty : undefined;
    const max_cook_time = req.query.max_cook_time != null ? Number(req.query.max_cook_time) : undefined;
    const min_protein = req.query.min_protein != null ? Number(req.query.min_protein) : undefined;

    const { rows, total } = await RecipeModel.search(
      { q, cuisine_type, difficulty, max_cook_time, min_protein },
      { limit, offset },
    );

    const body: ApiSuccess<{ recipes: Recipe[]; pagination: PaginatedResponse<Recipe>['pagination'] }> = {
      success: true,
      data: {
        recipes: rows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.max(1, Math.ceil(total / limit)),
        },
      },
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

/**
 * @route   GET /recipes/cuisine/:cuisineType
 * @access  public
 */
export async function listByCuisine(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { cuisineType } = req.params as { cuisineType: string };
    const { page, limit, offset } = req.pagination!;

    const { rows, total } = await RecipeModel.list(
      { cuisine_type: cuisineType },
      { limit, offset },
    );

    const body: ApiSuccess<{ recipes: Recipe[]; pagination: PaginatedResponse<Recipe>['pagination'] }> = {
      success: true,
      data: {
        recipes: rows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.max(1, Math.ceil(total / limit)),
        },
      },
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

/**
 * @route   GET /recipes/macro-match
 * @access  protected
 * @body    { remaining_calories, remaining_protein, remaining_carbs, remaining_fat, limit? }
 *
 * Note: spec asks for GET with body. Express + JSON parser allow this even
 * though it's unusual — clients can also POST the same payload if they prefer.
 */
export async function macroMatch(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const {
      remaining_calories,
      remaining_protein,
      remaining_carbs,
      remaining_fat,
      limit,
    } = req.body as {
      remaining_calories: number;
      remaining_protein: number;
      remaining_carbs: number;
      remaining_fat: number;
      limit?: number;
    };

    const candidates = await RecipeModel.listForMacroMatch();
    const ranked = rankByMacroMatch(
      candidates,
      { remaining_calories, remaining_protein, remaining_carbs, remaining_fat },
      limit ?? 10,
    );

    const body: ApiSuccess<{
      matches: Array<{ recipe: Recipe; score: number; nutrition: { calories: number; protein_g: number; carbs_g: number; fat_g: number } }>;
    }> = {
      success: true,
      data: {
        matches: ranked.map(({ recipe, score }) => {
          const { calories, protein_g, carbs_g, fat_g, ...rest } = recipe;
          return {
            recipe: rest as Recipe,
            score: Number(score.toFixed(4)),
            nutrition: { calories, protein_g, carbs_g, fat_g },
          };
        }),
      },
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

/**
 * @route   GET /recipes/:id
 * @access  public
 */
export async function getRecipe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const recipe = await RecipeModel.findById(req.params.id);
    if (!recipe) throw Errors.notFound('Recipe not found');

    const body: ApiSuccess<RecipeWithDetails> = {
      success: true,
      data: await hydrateRecipe(recipe),
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

/**
 * @route   POST /recipes
 * @access  admin
 *
 * Atomic — recipes, ingredients, and nutrition are written in a single
 * transaction so a failure rolls back partial inserts.
 */
export async function createRecipe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = req.body as {
      name: string;
      cuisine_type: string;
      difficulty: string;
      prep_time_minutes: number;
      cook_time_minutes: number;
      servings: number;
      instructions: Array<{ step_number: number; instruction: string; time_minutes?: number }>;
      ingredients: Array<{ ingredient_name: string; quantity: number; unit: string; notes?: string | null }>;
      image_url?: string | null;
      nutrition?: {
        calories: number; protein_g: number; carbs_g: number;
        fat_g: number; fiber_g: number; sodium_mg: number;
      };
    };

    const client = await pool.connect();
    let recipe: Recipe;
    try {
      await client.query('BEGIN');
      recipe = await RecipeModel.create(
        {
          name: body.name,
          cuisine_type: body.cuisine_type,
          difficulty: body.difficulty,
          prep_time_minutes: body.prep_time_minutes,
          cook_time_minutes: body.cook_time_minutes,
          servings: body.servings,
          instructions: body.instructions,
          image_url: body.image_url ?? null,
        },
        client,
      );
      await IngredientModel.insertMany(recipe.id, body.ingredients, client);
      if (body.nutrition) {
        await RecipeModel.upsertNutrition({ recipe_id: recipe.id, ...body.nutrition }, client);
      }
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK').catch(() => undefined);
      throw e;
    } finally {
      client.release();
    }

    const responseBody: ApiSuccess<RecipeWithDetails> = {
      success: true,
      data: await hydrateRecipe(recipe),
    };
    res.status(201).json(responseBody);
  } catch (err) {
    next(err);
  }
}

/**
 * @route   PUT /recipes/:id
 * @access  admin
 */
export async function updateRecipe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const updated = await RecipeModel.update(req.params.id, req.body);
    if (!updated) throw Errors.notFound('Recipe not found');

    const body: ApiSuccess<RecipeWithDetails> = {
      success: true,
      data: await hydrateRecipe(updated),
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

/**
 * @route   DELETE /recipes/:id
 * @access  admin
 */
export async function deleteRecipe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const ok = await RecipeModel.softDelete(req.params.id);
    if (!ok) throw Errors.notFound('Recipe not found');
    const body: ApiSuccess<{ message: string }> = {
      success: true,
      data: { message: 'Recipe deleted' },
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

/**
 * @route   POST /recipes/:id/rate
 * @access  protected
 *
 * The unique (recipe_id, user_id) constraint enforces "one rating per user".
 * The trigger on recipe_reviews keeps recipe_ratings in sync, so the response
 * includes the freshly recomputed average.
 */
export async function rateRecipe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const recipeId = req.params.id;
    const recipe = await RecipeModel.findById(recipeId);
    if (!recipe) throw Errors.notFound('Recipe not found');

    const { rating, comment } = req.body as { rating: number; comment?: string | null };

    try {
      await ReviewModel.create({
        recipe_id: recipeId,
        user_id: req.user!.userId,
        rating,
        comment: comment ?? null,
      });
    } catch (e) {
      if (typeof e === 'object' && e && (e as { code?: string }).code === '23505') {
        throw Errors.alreadyRated();
      }
      throw e;
    }

    const summary = await ReviewModel.getSummary(recipeId);
    const body: ApiSuccess<{ average_rating: number; total_ratings: number }> = {
      success: true,
      data: { average_rating: summary.average_rating, total_ratings: summary.total_ratings },
    };
    res.status(201).json(body);
  } catch (err) {
    next(err);
  }
}

/**
 * @route   GET /recipes/:id/reviews
 * @access  public
 */
export async function listReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { page, limit, offset } = req.pagination!;
    const recipe = await RecipeModel.findById(req.params.id);
    if (!recipe) throw Errors.notFound('Recipe not found');

    const { rows, total } = await ReviewModel.listByRecipeId(req.params.id, { limit, offset });

    const body: ApiSuccess<{ reviews: Review[]; pagination: PaginatedResponse<Review>['pagination'] }> = {
      success: true,
      data: {
        reviews: rows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.max(1, Math.ceil(total / limit)),
        },
      },
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}
