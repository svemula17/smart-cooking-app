import { Router } from 'express';
import { listRecipes, getRecipe, createRecipe } from '../controllers/recipeController';

export const recipesRouter = Router();
recipesRouter.get('/', listRecipes);
recipesRouter.get('/:id', getRecipe);
recipesRouter.post('/', createRecipe);
