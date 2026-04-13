import { Router } from 'express';
import * as authCtrl from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { loginSchema, refreshTokenSchema } from '../validations/index.js';

const router: ReturnType<typeof Router> = Router();

router.post('/login', validate(loginSchema), authCtrl.login);
router.post('/refresh', validate(refreshTokenSchema), authCtrl.refresh);
router.get('/me', authenticate, authCtrl.me);

export default router;
