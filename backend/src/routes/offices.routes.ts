import { Router } from 'express';
import * as officesCtrl from '../controllers/offices.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { createOfficeSchema, updateOfficeSchema } from '../validations/index.js';

const router: ReturnType<typeof Router> = Router();

router.get('/', authenticate, officesCtrl.list);
router.get('/:id', authenticate, officesCtrl.getById);
router.post('/', authenticate, authorize('ADMIN'), validate(createOfficeSchema), officesCtrl.create);
router.put('/:id', authenticate, authorize('ADMIN'), validate(updateOfficeSchema), officesCtrl.update);

export default router;
