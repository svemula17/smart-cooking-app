import type { Request, Response } from 'express';
import { RecipeModel } from '../models/Recipe';

export async function listRecipes(req: Request, res: Response) {
  const { q, cuisine } = req.query;
  const recipes = await RecipeModel.search({
    q: typeof q === 'string' ? q : undefined,
    cuisine: typeof cuisine === 'string' ? cuisine : undefined,
  });
  res.json(recipes);
}

export async function getRecipe(req: Request, res: Response) {
  const recipe = await RecipeModel.findById(req.params.id);
  if (!recipe) return res.status(404).json({ error: 'not_found' });
  res.json(recipe);
}

export async function createRecipe(req: Request, res: Response) {
  const recipe = await RecipeModel.create(req.body);
  res.status(201).json(recipe);
}
