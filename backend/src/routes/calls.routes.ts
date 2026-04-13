import { Router } from 'express';
import * as callsCtrl from '../controllers/calls.controller.js';

const router: ReturnType<typeof Router> = Router();

// Public endpoint — no auth required (used by TV screens)
router.get('/location/:locationId', callsCtrl.getRecent);

export default router;
