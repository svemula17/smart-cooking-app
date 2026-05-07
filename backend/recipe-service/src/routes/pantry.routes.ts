import { Router } from 'express';
import { pantryController } from '../controllers/pantry.controller';
import { authenticate } from '../middleware/auth.middleware';

export const pantryRouter = Router();

pantryRouter.use(authenticate);

pantryRouter.get('/', pantryController.list);
pantryRouter.post('/', pantryController.create);
pantryRouter.put('/:id', pantryController.update);
pantryRouter.delete('/:id', pantryController.remove);
pantryRouter.post('/deduct', pantryController.deduct);
