import { Request, Response, NextFunction } from 'express';
import * as officesRepo from '../repositories/offices.repository.js';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const locationId = req.query.location_id ? Number(req.query.location_id) : undefined;
    res.json(await officesRepo.findAll(locationId));
  } catch (err) { next(err); }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const office = await officesRepo.findById(Number(req.params.id));
    if (!office) { res.status(404).json({ error: 'Office not found' }); return; }
    res.json(office);
  } catch (err) { next(err); }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try { res.status(201).json(await officesRepo.create(req.body)); } catch (err) { next(err); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const office = await officesRepo.update(Number(req.params.id), req.body);
    if (!office) { res.status(404).json({ error: 'Office not found' }); return; }
    res.json(office);
  } catch (err) { next(err); }
}
