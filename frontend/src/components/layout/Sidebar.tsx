import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  Stethoscope,
  Monitor,
  Settings,
  BarChart3,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: string[];
}

const navItems: NavItem[] = [
  { to: '/dashboard', label: 'Panel', icon: LayoutDashboard, roles: ['ADMIN', 'RECEPTIONIST', 'PROFESSIONAL'] },
  { to: '/receptionist', label: 'Secretaria', icon: ClipboardList, roles: ['ADMIN', 'RECEPTIONIST'] },
  { to: '/professional', label: 'Profesional', icon: Stethoscope, roles: ['ADMIN', 'PROFESSIONAL'] },
  { to: '/admin', label: 'Administracion', icon: Settings, roles: ['ADMIN'] },
  { to: '/reports', label: 'Reportes', icon: BarChart3, roles: ['ADMIN', 'RECEPTIONIST'] },
];

export function Sidebar() {
  const { user, logout } = useAuthStore();
  const role = user?.role ?? '';

  const visibleItems = navItems.filter((item) => item.roles.includes(role));

  return (
    <aside className="flex h-full w-64 flex-col border-r bg-card">
      {/* Logo */}
      <div className="flex h-16 items-center px-6">
        <h1 className="text-xl font-bold text-primary">MediQ</h1>
      </div>

      <Separator />

      {/* Nav links */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}

        <Separator className="my-3" />

        {/* Link to public screen */}
        {user?.locationId && (
          <a
            href={`/screen/${user.locationId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <Monitor className="h-5 w-5" />
            Pantalla TV
          </a>
        )}
      </nav>

      {/* User info + logout */}
      <div className="border-t p-4">
        <div className="mb-3 px-2">
          <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
          <p className="text-xs text-muted-foreground capitalize">{role.toLowerCase()}</p>
        </div>
        <Button variant="ghost" size="sm" className="w-full justify-start gap-2" onClick={logout}>
          <LogOut className="h-4 w-4" />
          Cerrar sesion
        </Button>
      </div>
    </aside>
  );
}
