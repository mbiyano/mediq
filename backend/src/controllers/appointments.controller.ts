import { Request, Response, NextFunction } from 'express';
import * as appointmentsService from '../services/appointments.service.js';
import { AuthUser } from '../types/index.js';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const appointments = await appointmentsService.listAppointments(req.query as Record<string, string>);
    res.json(appointments);
  } catch (err) { next(err); }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const appointment = await appointmentsService.getAppointment(Number(req.params.id));
    res.json(appointment);
  } catch (err) { next(err); }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const appointment = await appointmentsService.createAppointment(req.body, req.user as AuthUser);
    res.status(201).json(appointment);
  } catch (err) { next(err); }
}

export async function changeStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const { status, comment, target_professional_id, target_office_id } = req.body;
    const result = await appointmentsService.changeStatus(
      Number(req.params.id),
      status,
      req.user as AuthUser,
      comment,
      { target_professional_id, target_office_id },
    );

    const io = req.app.get('io');
    if (io) {
      const appointment = result.appointment;
      const eventName = getSocketEvent(status);
      const payload = { appointment, audioText: result.audioText };
      io.to(`location:${appointment.location_id}`).emit(eventName, payload);
      if (appointment.professional_id) {
        io.to(`professional:${appointment.professional_id}`).emit(eventName, payload);
      }
    }

    res.json(result);
  } catch (err) { next(err); }
}

export async function getStats(req: Request, res: Response, next: NextFunction) {
  try {
    const locationId = Number(req.params.locationId);
    const date = req.query.date as string | undefined;
    const stats = await appointmentsService.getStats(locationId, date);
    res.json(stats);
  } catch (err) { next(err); }
}

export async function getHistory(req: Request, res: Response, next: NextFunction) {
  try {
    const history = await appointmentsService.getHistory(Number(req.params.id));
    res.json(history);
  } catch (err) { next(err); }
}

function getSocketEvent(status: string): string {
  const map: Record<string, string> = {
    CALLING: 'appointment:called',
    IN_SERVICE: 'appointment:in_service',
    COMPLETED: 'appointment:completed',
    ABSENT: 'appointment:absent',
    CANCELLED: 'appointment:cancelled',
    TRANSFERRED: 'appointment:transferred',
  };
  return map[status] ?? 'appointment:updated';
}
