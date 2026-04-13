import { Request, Response, NextFunction } from 'express';
import * as professionalsRepo from '../repositories/professionals.repository.js';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const locationId = req.query.location_id ? Number(req.query.location_id) : undefined;
    res.json(await professionalsRepo.findAll(locationId));
  } catch (err) { next(err); }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const professional = await professionalsRepo.findById(Number(req.params.id));
    if (!professional) { res.status(404).json({ error: 'Professional not found' }); return; }
    res.json(professional);
  } catch (err) { next(err); }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try { res.status(201).json(await professionalsRepo.create(req.body)); } catch (err) { next(err); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const professional = await professionalsRepo.update(Number(req.params.id), req.body);
    if (!professional) { res.status(404).json({ error: 'Professional not found' }); return; }
    res.json(professional);
  } catch (err) { next(err); }
}
