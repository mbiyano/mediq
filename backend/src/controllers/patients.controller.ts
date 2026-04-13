import { Request, Response, NextFunction } from 'express';
import * as patientsRepo from '../repositories/patients.repository.js';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const search = req.query.search as string | undefined;
    res.json(await patientsRepo.findAll(search));
  } catch (err) { next(err); }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const patient = await patientsRepo.findById(Number(req.params.id));
    if (!patient) { res.status(404).json({ error: 'Patient not found' }); return; }
    res.json(patient);
  } catch (err) { next(err); }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try { res.status(201).json(await patientsRepo.create(req.body)); } catch (err) { next(err); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const patient = await patientsRepo.update(Number(req.params.id), req.body);
    if (!patient) { res.status(404).json({ error: 'Patient not found' }); return; }
    res.json(patient);
  } catch (err) { next(err); }
}
