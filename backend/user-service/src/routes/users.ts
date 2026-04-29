import { Router } from 'express';
import { getMe, updateMe } from '../controllers/userController';
import { requireAuth } from '../middleware/requireAuth';

export const usersRouter = Router();
usersRouter.get('/me', requireAuth, getMe);
usersRouter.patch('/me', requireAuth, updateMe);
