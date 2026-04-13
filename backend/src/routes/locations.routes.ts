import { Router } from 'express';
import * as locationsCtrl from '../controllers/locations.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { createLocationSchema, updateLocationSchema } from '../validations/index.js';

const router: ReturnType<typeof Router> = Router();

router.get('/', authenticate, locationsCtrl.list);
router.get('/:id', authenticate, locationsCtrl.getById);
router.post('/', authenticate, authorize('ADMIN'), validate(createLocationSchema), locationsCtrl.create);
router.put('/:id', authenticate, authorize('ADMIN'), validate(updateLocationSchema), locationsCtrl.update);

export default router;
