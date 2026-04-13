import { Request, Response, NextFunction } from 'express';
import * as callsRepo from '../repositories/calls.repository.js';

export async function getRecent(req: Request, res: Response, next: NextFunction) {
  try {
    const locationId = Number(req.params.locationId);
    const limit = req.query.limit ? Number(req.query.limit) : 5;
    res.json(await callsRepo.findRecent(locationId, limit));
  } catch (err) { next(err); }
}
