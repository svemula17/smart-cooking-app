import type { Request, Response, NextFunction } from 'express';
import { UserModel } from '../models/User';

export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).userId as string;
    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ error: 'not_found' });
    res.json({ id: user.id, email: user.email, name: user.name });
  } catch (e) { next(e); }
}

export async function updateMe(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).userId as string;
    const updated = await UserModel.update(userId, req.body);
    res.json(updated);
  } catch (e) { next(e); }
}
