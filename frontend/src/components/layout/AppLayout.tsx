import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { useSocket } from '@/hooks/useSocket';
import { useAuthStore } from '@/stores/auth.store';
import { useEffect } from 'react';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const socket = useSocket();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!user?.locationId) return;
    socket.emit('join:location', user.locationId);

    return () => {
      socket.emit('leave:location', user.locationId);
    };
  }, [socket, user?.locationId]);

  useEffect(() => {
    if (!user?.professionalId) return;
    socket.emit('join:professional', user.professionalId);

    return () => {
      socket.emit('leave:professional', user.professionalId);
    };
  }, [socket, user?.professionalId]);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
