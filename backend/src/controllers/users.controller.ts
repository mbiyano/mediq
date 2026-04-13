import { Request, Response, NextFunction } from 'express';
import * as usersRepo from '../repositories/users.repository.js';
import { hashPassword } from '../utils/password.js';

export async function list(_req: Request, res: Response, next: NextFunction) {
  try { res.json(await usersRepo.findAll()); } catch (err) { next(err); }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await usersRepo.findById(Number(req.params.id));
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }
    res.json(user);
  } catch (err) { next(err); }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const { password, ...rest } = req.body;
    const password_hash = await hashPassword(password);
    res.status(201).json(await usersRepo.create({ ...rest, password_hash }));
  } catch (err) { next(err); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const { password, ...rest } = req.body;
    const data: Record<string, unknown> = { ...rest };
    if (password) {
      data.password_hash = await hashPassword(password);
    }
    const user = await usersRepo.update(Number(req.params.id), data as Parameters<typeof usersRepo.update>[1]);
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }
    res.json(user);
  } catch (err) { next(err); }
}
