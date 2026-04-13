import { Request, Response, NextFunction } from 'express';
import * as locationsRepo from '../repositories/locations.repository.js';

export async function list(_req: Request, res: Response, next: NextFunction) {
  try { res.json(await locationsRepo.findAll()); } catch (err) { next(err); }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const location = await locationsRepo.findById(Number(req.params.id));
    if (!location) { res.status(404).json({ error: 'Location not found' }); return; }
    res.json(location);
  } catch (err) { next(err); }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try { res.status(201).json(await locationsRepo.create(req.body)); } catch (err) { next(err); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const location = await locationsRepo.update(Number(req.params.id), req.body);
    if (!location) { res.status(404).json({ error: 'Location not found' }); return; }
    res.json(location);
  } catch (err) { next(err); }
}
