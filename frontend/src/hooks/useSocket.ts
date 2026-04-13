import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/stores/auth.store';
import { API_BASE } from '@/services/api';

let globalSocket: Socket | null = null;

export function getSocket(): Socket {
  if (!globalSocket) {
    const token = localStorage.getItem('accessToken');
    globalSocket = io(API_BASE || '/', {
      auth: { token: token ?? undefined },
      transports: ['websocket', 'polling'],
    });
  }
  return globalSocket;
}

export function disconnectSocket() {
  if (globalSocket) {
    globalSocket.disconnect();
    globalSocket = null;
  }
}

export function useSocket() {
  const socketRef = useRef<Socket>(getSocket());
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) return;

    const socket = getSocket();
    socketRef.current = socket;

    if (!socket.connected) {
      socket.auth = { token: localStorage.getItem('accessToken') ?? undefined };
      socket.connect();
    }

    return () => {
      // Don't disconnect on unmount — keep connection alive globally
    };
  }, [isAuthenticated]);

  return socketRef.current;
}

export function useSocketEvent<T = unknown>(
  event: string,
  handler: (data: T) => void,
  deps: unknown[] = [],
) {
  const socket = useSocket();

  useEffect(() => {
    socket.on(event, handler);
    return () => {
      socket.off(event, handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event, socket, ...deps]);
}
