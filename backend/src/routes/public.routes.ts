import { Router } from 'express';
import * as appointmentsRepo from '../repositories/appointments.repository.js';
import * as callsRepo from '../repositories/calls.repository.js';
import * as settingsRepo from '../repositories/settings.repository.js';

const router: ReturnType<typeof Router> = Router();

// Public endpoints for TV screens — no authentication required

router.get('/appointments/location/:locationId', async (req, res, next) => {
  try {
    const locationId = Number(req.params.locationId);
    const appointments = await appointmentsRepo.findByFilters({
      location_id: locationId,
    });
    // Filter to only show relevant states for public view
    const publicAppointments = appointments.filter(a =>
      ['WAITING', 'CALLING', 'IN_SERVICE'].includes(a.status)
    );
    res.json(publicAppointments);
  } catch (err) { next(err); }
});

router.get('/calls/location/:locationId', async (req, res, next) => {
  try {
    const locationId = Number(req.params.locationId);
    const limit = req.query.limit ? Number(req.query.limit) : 5;
    res.json(await callsRepo.findRecent(locationId, limit));
  } catch (err) { next(err); }
});

router.get('/settings/location/:locationId', async (req, res, next) => {
  try {
    const locationId = Number(req.params.locationId);
    const settings = await settingsRepo.findAll(locationId);
    // Only return display-related settings
    const publicKeys = [
      'INSTITUTION_NAME', 'SCREEN_PRIVACY_MODE', 'SCREEN_VISIBLE_CALLS',
      'SCREEN_BACKGROUND_COLOR', 'SCREEN_CALL_COLOR', 'AUDIO_ENABLED',
      'AUDIO_TEMPLATE', 'AUDIO_VOICE_LANG', 'AUDIO_VOICE_RATE', 'AUDIO_VOICE_PITCH',
    ];
    const filtered = settings.filter(s => publicKeys.includes(s.key));
    res.json(filtered);
  } catch (err) { next(err); }
});

export default router;
