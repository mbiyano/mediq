import { Router } from 'express';
import * as appointmentsCtrl from '../controllers/appointments.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { createAppointmentSchema, updateAppointmentStatusSchema, appointmentFiltersSchema } from '../validations/index.js';

const router: ReturnType<typeof Router> = Router();

router.get('/', authenticate, validate(appointmentFiltersSchema, 'query'), appointmentsCtrl.list);
router.get('/stats/:locationId', authenticate, appointmentsCtrl.getStats);
router.get('/:id', authenticate, appointmentsCtrl.getById);
router.get('/:id/history', authenticate, appointmentsCtrl.getHistory);
router.post('/', authenticate, authorize('RECEPTIONIST', 'ADMIN'), validate(createAppointmentSchema), appointmentsCtrl.create);
router.patch('/:id/status', authenticate, validate(updateAppointmentStatusSchema), appointmentsCtrl.changeStatus);

export default router;
