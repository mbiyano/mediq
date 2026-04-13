import { Router } from 'express';
import * as rolesRepo from '../repositories/roles.repository.js';
import { authenticate } from '../middlewares/auth.js';

const router: ReturnType<typeof Router> = Router();

router.get('/', authenticate, async (_req, res, next) => {
  try { res.json(await rolesRepo.findAll()); } catch (err) { next(err); }
});

export default router;
