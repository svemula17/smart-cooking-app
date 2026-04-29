import { Router, Request, Response } from 'express';

interface ShoppingItem { id: string; name: string; quantity: number; unit: string; checked: boolean; }
const lists = new Map<string, ShoppingItem[]>();

export const listsRouter = Router();

listsRouter.get('/:userId', (req: Request, res: Response) => {
  res.json(lists.get(req.params.userId) ?? []);
});

listsRouter.post('/:userId/items', (req: Request, res: Response) => {
  const list = lists.get(req.params.userId) ?? [];
  const item: ShoppingItem = {
    id: String(Date.now()),
    name: req.body.name,
    quantity: req.body.quantity ?? 1,
    unit: req.body.unit ?? 'unit',
    checked: false,
  };
  list.push(item);
  lists.set(req.params.userId, list);
  res.status(201).json(item);
});

listsRouter.patch('/:userId/items/:itemId', (req: Request, res: Response) => {
  const list = lists.get(req.params.userId) ?? [];
  const item = list.find((i) => i.id === req.params.itemId);
  if (!item) return res.status(404).json({ error: 'not_found' });
  Object.assign(item, req.body);
  res.json(item);
});
