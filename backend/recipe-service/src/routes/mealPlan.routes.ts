import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { deleteMealPlan, getMealPlans, scheduleMeal, updateMealPlan } from '../controllers/mealPlan.controller';

export const mealPlanRouter = Router();

mealPlanRouter.post('/schedule', authenticate, scheduleMeal);
mealPlanRouter.get('/:userId', authenticate, getMealPlans);
mealPlanRouter.put('/:id', authenticate, updateMealPlan);
mealPlanRouter.delete('/:id', authenticate, deleteMealPlan);
