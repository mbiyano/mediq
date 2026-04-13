import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Bell } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { Badge } from '@/components/ui/badge';

export function Header() {
  const user = useAuthStore((s) => s.user);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6">
      <div>
        <p className="text-sm text-muted-foreground">
          {format(now, "EEEE d 'de' MMMM, yyyy", { locale: es })}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <Badge variant="outline" className="gap-1.5">
          <Bell className="h-3.5 w-3.5" />
          En linea
        </Badge>

        {user && (
          <div className="text-right">
            <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
            <p className="text-xs text-muted-foreground capitalize">{user.role.toLowerCase()}</p>
          </div>
        )}
      </div>
    </header>
  );
}
