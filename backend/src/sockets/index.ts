import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { verifyAccessToken } from '../utils/token.js';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';

export function setupSocketIO(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: {
      origin: true,
      methods: ['GET', 'POST'],
    },
  });

  // Auth middleware — optional for public screens
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (token) {
      try {
        const payload = verifyAccessToken(token);
        socket.data.user = payload;
      } catch {
        // Allow connection but mark as public
        socket.data.user = null;
      }
    } else {
      socket.data.user = null;
    }
    next();
  });

  io.on('connection', (socket) => {
    const user = socket.data.user;
    logger.info({ socketId: socket.id, user: user?.username ?? 'public' }, 'Socket connected');

    // Join location room
    socket.on('join:location', (locationId: number) => {
      const room = `location:${locationId}`;
      socket.join(room);
      logger.debug({ socketId: socket.id, room }, 'Joined room');
    });

    // Join professional room
    socket.on('join:professional', (professionalId: number) => {
      const room = `professional:${professionalId}`;
      socket.join(room);
      logger.debug({ socketId: socket.id, room }, 'Joined room');
    });

    // Join screen room
    socket.on('join:screen', (screenId: number) => {
      const room = `screen:${screenId}`;
      socket.join(room);
      logger.debug({ socketId: socket.id, room }, 'Joined room');
    });

    // Leave rooms
    socket.on('leave:location', (locationId: number) => socket.leave(`location:${locationId}`));
    socket.on('leave:professional', (id: number) => socket.leave(`professional:${id}`));
    socket.on('leave:screen', (id: number) => socket.leave(`screen:${id}`));

    socket.on('disconnect', (reason) => {
      logger.debug({ socketId: socket.id, reason }, 'Socket disconnected');
    });
  });

  return io;
}
