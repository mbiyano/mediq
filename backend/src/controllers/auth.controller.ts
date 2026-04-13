import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service.js';

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { username, password } = req.body;
    const result = await authService.login(username, password);
    res.json(result);
  } catch (err) { next(err); }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = req.body;
    const result = await authService.refresh(refreshToken);
    res.json(result);
  } catch (err) { next(err); }
}

export async function me(req: Request, res: Response) {
  res.json({ user: req.user });
}
