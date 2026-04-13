import { Router } from 'express';
import * as patientsCtrl from '../controllers/patients.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { createPatientSchema, updatePatientSchema } from '../validations/index.js';

const router: ReturnType<typeof Router> = Router();

router.get('/', authenticate, patientsCtrl.list);
router.get('/:id', authenticate, patientsCtrl.getById);
router.post('/', authenticate, authorize('RECEPTIONIST', 'ADMIN'), validate(createPatientSchema), patientsCtrl.create);
router.put('/:id', authenticate, authorize('RECEPTIONIST', 'ADMIN'), validate(updatePatientSchema), patientsCtrl.update);

export default router;
