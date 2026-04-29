import type { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { UserModel } from '../models/User';

const credSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).optional(),
});

const SECRET = process.env.JWT_SECRET ?? 'dev-secret';
const EXPIRES = process.env.JWT_EXPIRES_IN ?? '7d';
const ROUNDS = Number(process.env.BCRYPT_ROUNDS ?? 12);

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const data = credSchema.parse(req.body);
    const hash = await bcrypt.hash(data.password, ROUNDS);
    const user = await UserModel.create({ email: data.email, name: data.name ?? '', passwordHash: hash });
    const token = jwt.sign({ sub: user.id }, SECRET, { expiresIn: EXPIRES });
    res.status(201).json({ user, token });
  } catch (e) { next(e); }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const data = credSchema.parse(req.body);
    const user = await UserModel.findByEmail(data.email);
    if (!user) return res.status(401).json({ error: 'invalid_credentials' });
    const ok = await bcrypt.compare(data.password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'invalid_credentials' });
    const token = jwt.sign({ sub: user.id }, SECRET, { expiresIn: EXPIRES });
    res.json({ user: { id: user.id, email: user.email, name: user.name }, token });
  } catch (e) { next(e); }
}
