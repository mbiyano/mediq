import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { env } from './config/env.js';
import { testConnection } from './config/db.js';
import { logger } from './utils/logger.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { setupSocketIO } from './sockets/index.js';

// Routes
import authRoutes from './routes/auth.routes.js';
import appointmentsRoutes from './routes/appointments.routes.js';
import locationsRoutes from './routes/locations.routes.js';
import officesRoutes from './routes/offices.routes.js';
import professionalsRoutes from './routes/professionals.routes.js';
import patientsRoutes from './routes/patients.routes.js';
import usersRoutes from './routes/users.routes.js';
import settingsRoutes from './routes/settings.routes.js';
import callsRoutes from './routes/calls.routes.js';
import reportsRoutes from './routes/reports.routes.js';
import rolesRoutes from './routes/roles.routes.js';
import publicRoutes from './routes/public.routes.js';

const app = express();
const httpServer = createServer(app);

// Socket.IO
const io = setupSocketIO(httpServer);
app.set('io', io);

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/locations', locationsRoutes);
app.use('/api/offices', officesRoutes);
app.use('/api/professionals', professionalsRoutes);
app.use('/api/patients', patientsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/calls', callsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/roles', rolesRoutes);

// Public routes (no auth)
app.use('/api/public', publicRoutes);

// Error handler
app.use(errorHandler);

// Start
async function start() {
  try {
    await testConnection();
    httpServer.listen(env.PORT, () => {
      logger.info({ port: env.PORT, env: env.NODE_ENV }, 'MediQ backend running');
    });
  } catch (err) {
    logger.fatal({ err }, 'Failed to start server');
    process.exit(1);
  }
}

start();
