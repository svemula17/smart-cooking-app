import { Router } from 'express';
import {
  getMe,
  goalsSchema,
  restrictionsSchema,
  setGoals,
  setRestrictions,
  updateMe,
  updateProfileSchema,
} from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';

export const userRouter = Router();

userRouter.use(authMiddleware);
userRouter.get('/me', getMe);
userRouter.put('/me', validate(updateProfileSchema), updateMe);
userRouter.put('/me/goals', validate(goalsSchema), setGoals);
userRouter.put('/me/restrictions', validate(restrictionsSchema), setRestrictions);
