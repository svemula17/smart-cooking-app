import { Router } from 'express';
import {
  getProfile,
  updateGoals,
  updateProfile,
  updateRestrictions,
} from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  macroGoalsSchema,
  restrictionsSchema,
  updateProfileSchema,
} from '../utils/validation.schemas';

export const userRouter = Router();

userRouter.use(authenticate);
userRouter.get('/me', getProfile);
userRouter.put('/me', validate(updateProfileSchema), updateProfile);
userRouter.put('/me/goals', validate(macroGoalsSchema), updateGoals);
userRouter.put('/me/restrictions', validate(restrictionsSchema), updateRestrictions);
