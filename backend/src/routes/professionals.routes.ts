import { Router } from 'express';
import * as professionalsCtrl from '../controllers/professionals.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { createProfessionalSchema, updateProfessionalSchema } from '../validations/index.js';

const router: ReturnType<typeof Router> = Router();

router.get('/', authenticate, professionalsCtrl.list);
router.get('/:id', authenticate, professionalsCtrl.getById);
router.post('/', authenticate, authorize('ADMIN'), validate(createProfessionalSchema), professionalsCtrl.create);
router.put('/:id', authenticate, authorize('ADMIN'), validate(updateProfessionalSchema), professionalsCtrl.update);

export default router;
