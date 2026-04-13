import { Request, Response, NextFunction } from 'express';
import * as settingsRepo from '../repositories/settings.repository.js';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const locationId = req.query.location_id ? Number(req.query.location_id) : null;
    res.json(await settingsRepo.findAll(locationId));
  } catch (err) { next(err); }
}

export async function upsert(req: Request, res: Response, next: NextFunction) {
  try {
    const setting = await settingsRepo.upsert(req.body);
    const io = req.app.get('io');
    if (io) {
      io.emit('config:updated', setting);
    }
    res.json(setting);
  } catch (err) { next(err); }
}
