import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/db.js';

export async function appointmentsByDate(req: Request, res: Response, next: NextFunction) {
  try {
    const { location_id, date_from, date_to } = req.query;
    const { rows } = await pool.query(
      `SELECT appointment_date, status, COUNT(*) as count
       FROM appointments
       WHERE location_id = $1 AND appointment_date >= $2 AND appointment_date <= $3 AND active = TRUE
       GROUP BY appointment_date, status
       ORDER BY appointment_date DESC, status`,
      [location_id, date_from, date_to],
    );
    res.json(rows);
  } catch (err) { next(err); }
}

export async function waitTimes(req: Request, res: Response, next: NextFunction) {
  try {
    const { location_id, date } = req.query;
    const { rows } = await pool.query(
      `SELECT a.ticket_number,
              p.first_name || ' ' || p.last_name AS patient,
              pr.first_name || ' ' || pr.last_name AS professional,
              EXTRACT(EPOCH FROM (a.called_at - a.created_at)) / 60 AS wait_minutes,
              EXTRACT(EPOCH FROM (a.finished_at - a.attended_at)) / 60 AS service_minutes
       FROM appointments a
       LEFT JOIN patients p ON a.patient_id = p.id
       LEFT JOIN professionals pr ON a.professional_id = pr.id
       WHERE a.location_id = $1 AND a.appointment_date = $2 AND a.active = TRUE
         AND a.status IN ('COMPLETED', 'IN_SERVICE')
       ORDER BY a.created_at`,
      [location_id, date],
    );
    res.json(rows);
  } catch (err) { next(err); }
}

export async function byProfessional(req: Request, res: Response, next: NextFunction) {
  try {
    const { location_id, date_from, date_to } = req.query;
    const { rows } = await pool.query(
      `SELECT pr.first_name || ' ' || pr.last_name AS professional,
              pr.specialty,
              COUNT(*) FILTER (WHERE a.status = 'COMPLETED') AS completed,
              COUNT(*) FILTER (WHERE a.status = 'ABSENT') AS absent,
              COUNT(*) AS total,
              AVG(EXTRACT(EPOCH FROM (a.finished_at - a.attended_at)) / 60)
                FILTER (WHERE a.finished_at IS NOT NULL) AS avg_service_minutes
       FROM appointments a
       JOIN professionals pr ON a.professional_id = pr.id
       WHERE a.location_id = $1 AND a.appointment_date >= $2 AND a.appointment_date <= $3 AND a.active = TRUE
       GROUP BY pr.id, pr.first_name, pr.last_name, pr.specialty
       ORDER BY total DESC`,
      [location_id, date_from, date_to],
    );
    res.json(rows);
  } catch (err) { next(err); }
}

export async function eventHistory(req: Request, res: Response, next: NextFunction) {
  try {
    const { location_id, date_from, date_to } = req.query;
    const { rows } = await pool.query(
      `SELECT h.*, a.ticket_number,
              u.first_name || ' ' || u.last_name AS user_name
       FROM appointment_history h
       JOIN appointments a ON h.appointment_id = a.id
       LEFT JOIN users u ON h.user_id = u.id
       WHERE a.location_id = $1 AND h.event_at >= $2 AND h.event_at <= $3
       ORDER BY h.event_at DESC
       LIMIT 500`,
      [location_id, date_from, date_to],
    );
    res.json(rows);
  } catch (err) { next(err); }
}
