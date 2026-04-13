import { Router } from 'express';
import * as settingsCtrl from '../controllers/settings.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { updateSettingSchema } from '../validations/index.js';

const router: ReturnType<typeof Router> = Router();

router.get('/', authenticate, settingsCtrl.list);
router.put('/', authenticate, authorize('ADMIN'), validate(updateSettingSchema), settingsCtrl.upsert);

export default router;
