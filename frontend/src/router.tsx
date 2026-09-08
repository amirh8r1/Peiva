import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { RoleLandingPage } from '@/pages/RoleLandingPage';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { useAuth, type AuthRole } from '@/context/AuthContext';
import { ContractProgressPage } from '@/features/progress/pages/ContractProgressPage';
import { AdminDashboard } from '@/features/admin/pages/Dashboard';
import { RequestsInboxPage } from '@/features/admin/pages/RequestsInboxPage';
import { AdminRequestDetailPage } from '@/features/admin/pages/RequestDetailPage';
import { AdminContractsPage } from '@/features/admin/pages/ContractsPage';
import { SupplierDashboard } from '@/features/supplier/pages/Dashboard';
import { SupplierRequestDetailPage } from '@/features/supplier/pages/RequestDetailPage';
import { SupplierContractsPage } from '@/features/supplier/pages/ContractsPage';
import { FarmDashboard } from '@/features/farm/pages/Dashboard';
import { FarmContractsPage } from '@/features/farm/pages/ContractsPage';

/** گارد نقش — بدون نشست (یا نشست نقش دیگر) به صفحه ورود همان نقش می‌رود. */
function RequireAuth({ role, children }: { role: AuthRole; children: React.ReactElement }) {
  const { session } = useAuth();
  if (!session || session.role !== role) {
    return <Navigate to={`/login?role=${role}`} replace />;
  }
  return children;
}

/** روت نقش با گارد ورود — همه پنل‌ها پشت احراز هویت هستند. */
const roleRoute = (role: AuthRole, element: React.ReactElement) => (
  <RequireAuth role={role}>{element}</RequireAuth>
);

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<RoleLandingPage />} />
      <Route path="/login" element={<LoginPage />} />

      <Route element={<AppLayout />}>
        {/* Chain owner (admin) routes */}
        <Route path="/admin" element={roleRoute('admin', <AdminDashboard />)} />
        <Route path="/admin/requests" element={roleRoute('admin', <RequestsInboxPage />)} />
        <Route path="/admin/requests/:id" element={roleRoute('admin', <AdminRequestDetailPage />)} />
        <Route path="/admin/contracts" element={roleRoute('admin', <AdminContractsPage />)} />
        <Route path="/admin/contracts/:id/progress" element={roleRoute('admin', <ContractProgressPage />)} />

        {/* Participant (supplier) routes */}
        <Route path="/supplier" element={roleRoute('supplier', <SupplierDashboard />)} />
        <Route path="/supplier/requests/:id" element={roleRoute('supplier', <SupplierRequestDetailPage />)} />
        <Route path="/supplier/contracts" element={roleRoute('supplier', <SupplierContractsPage />)} />
        <Route path="/supplier/contracts/:id/progress" element={roleRoute('supplier', <ContractProgressPage />)} />

        {/* Farm owner routes */}
        <Route path="/farm" element={roleRoute('farm', <FarmDashboard />)} />
        <Route path="/farm/contracts" element={roleRoute('farm', <FarmContractsPage />)} />
        <Route path="/farm/contracts/:id/progress" element={roleRoute('farm', <ContractProgressPage />)} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
