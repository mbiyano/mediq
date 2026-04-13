import { Router } from 'express';
import * as reportsCtrl from '../controllers/reports.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router: ReturnType<typeof Router> = Router();

router.get('/appointments-by-date', authenticate, authorize('ADMIN', 'RECEPTIONIST'), reportsCtrl.appointmentsByDate);
router.get('/wait-times', authenticate, authorize('ADMIN', 'RECEPTIONIST'), reportsCtrl.waitTimes);
router.get('/by-professional', authenticate, authorize('ADMIN'), reportsCtrl.byProfessional);
router.get('/event-history', authenticate, authorize('ADMIN'), reportsCtrl.eventHistory);

export default router;
