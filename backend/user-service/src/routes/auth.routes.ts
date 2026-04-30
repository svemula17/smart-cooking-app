import { Router } from 'express';
import { login, logout, refresh, register } from '../controllers/auth.controller';
import { authRateLimiter } from '../middleware/rateLimiter.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  loginSchema,
  refreshTokenSchema,
  registerSchema,
} from '../utils/validation.schemas';

export const authRouter = Router();

authRouter.post('/register', authRateLimiter, validate(registerSchema), register);
authRouter.post('/login', authRateLimiter, validate(loginSchema), login);
authRouter.post('/refresh', authRateLimiter, validate(refreshTokenSchema), refresh);
authRouter.post('/logout', validate(refreshTokenSchema), logout);
