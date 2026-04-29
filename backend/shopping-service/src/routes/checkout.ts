import { Router, Request, Response } from 'express';
import { createInstacartCart } from '../integrations/instacart';
import { createWalmartCart } from '../integrations/walmart';

export const checkoutRouter = Router();

checkoutRouter.post('/instacart', async (req: Request, res: Response) => {
  const result = await createInstacartCart(req.body.items ?? []);
  res.json(result);
});

checkoutRouter.post('/walmart', async (req: Request, res: Response) => {
  const result = await createWalmartCart(req.body.items ?? []);
  res.json(result);
});
