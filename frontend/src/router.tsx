import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { AppLayout } from '@/components/layout/AppLayout';

// Lazy-loaded pages
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import ReceptionistPage from '@/pages/ReceptionistPage';
import ProfessionalPage from '@/pages/ProfessionalPage';
import PublicScreenPage from '@/pages/PublicScreenPage';
import AdminPage from '@/pages/AdminPage';
import ReportsPage from '@/pages/ReportsPage';

function RequireAuth({ allowedRoles }: { allowedRoles?: string[] }) {
  const { isAuthenticated, user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}

function PublicOnly() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <PublicOnly />,
    children: [{ index: true, element: <LoginPage /> }],
  },
  {
    path: '/screen/:locationId',
    element: <PublicScreenPage />,
  },
  {
    path: '/',
    element: <RequireAuth />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
    ],
  },
  {
    path: '/receptionist',
    element: <RequireAuth allowedRoles={['RECEPTIONIST', 'ADMIN']} />,
    children: [{ index: true, element: <ReceptionistPage /> }],
  },
  {
    path: '/professional',
    element: <RequireAuth allowedRoles={['PROFESSIONAL', 'ADMIN']} />,
    children: [{ index: true, element: <ProfessionalPage /> }],
  },
  {
    path: '/admin',
    element: <RequireAuth allowedRoles={['ADMIN']} />,
    children: [{ index: true, element: <AdminPage /> }],
  },
  {
    path: '/reports',
    element: <RequireAuth allowedRoles={['ADMIN', 'RECEPTIONIST']} />,
    children: [{ index: true, element: <ReportsPage /> }],
  },
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
]);
