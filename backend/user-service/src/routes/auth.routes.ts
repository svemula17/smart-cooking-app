import { Router } from 'express';
import {
  forgotPassword,
  forgotPasswordSchema,
  login,
  loginSchema,
  refresh,
  refreshSchema,
  register,
  registerSchema,
  resetPassword,
  resetPasswordSchema,
} from '../controllers/auth.controller';
import { validate } from '../middleware/validation.middleware';

export const authRouter = Router();

authRouter.post('/register', validate(registerSchema), register);
authRouter.post('/login', validate(loginSchema), login);
authRouter.post('/refresh', validate(refreshSchema), refresh);
authRouter.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
authRouter.post('/reset-password', validate(resetPasswordSchema), resetPassword);
