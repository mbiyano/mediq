import { Router } from 'express';
import * as usersCtrl from '../controllers/users.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { createUserSchema, updateUserSchema } from '../validations/index.js';

const router: ReturnType<typeof Router> = Router();

router.get('/', authenticate, authorize('ADMIN'), usersCtrl.list);
router.get('/:id', authenticate, authorize('ADMIN'), usersCtrl.getById);
router.post('/', authenticate, authorize('ADMIN'), validate(createUserSchema), usersCtrl.create);
router.put('/:id', authenticate, authorize('ADMIN'), validate(updateUserSchema), usersCtrl.update);

export default router;
