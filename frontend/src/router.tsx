import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { RoleLandingPage } from '@/pages/RoleLandingPage';
import { ContractProgressPage } from '@/features/progress/pages/ContractProgressPage';
import { AdminDashboard } from '@/features/admin/pages/Dashboard';
import { RequestsInboxPage } from '@/features/admin/pages/RequestsInboxPage';
import { AdminRequestDetailPage } from '@/features/admin/pages/RequestDetailPage';
import { AdminContractsPage } from '@/features/admin/pages/ContractsPage';
import { SupplierDashboard } from '@/features/supplier/pages/Dashboard';
import { NewRequestPage as SupplierNewRequestPage } from '@/features/supplier/pages/NewRequestPage';
import { SupplierRequestsPage } from '@/features/supplier/pages/RequestsPage';
import { SupplierRequestDetailPage } from '@/features/supplier/pages/RequestDetailPage';
import { SupplierContractsPage } from '@/features/supplier/pages/ContractsPage';
import { FarmDashboard } from '@/features/farm/pages/Dashboard';
import { FarmContractsPage } from '@/features/farm/pages/ContractsPage';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<RoleLandingPage />} />

      <Route element={<AppLayout />}>
        {/* Chain owner (admin) routes */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/requests" element={<RequestsInboxPage />} />
        <Route path="/admin/requests/:id" element={<AdminRequestDetailPage />} />
        <Route path="/admin/contracts" element={<AdminContractsPage />} />
        <Route path="/admin/contracts/:id/progress" element={<ContractProgressPage />} />

        {/* Supplier routes */}
        <Route path="/supplier" element={<SupplierDashboard />} />
        <Route path="/supplier/requests/new" element={<SupplierNewRequestPage />} />
        <Route path="/supplier/requests" element={<SupplierRequestsPage />} />
        <Route path="/supplier/requests/:id" element={<SupplierRequestDetailPage />} />
        <Route path="/supplier/contracts" element={<SupplierContractsPage />} />
        <Route path="/supplier/contracts/:id/progress" element={<ContractProgressPage />} />

        {/* Farm owner routes */}
        <Route path="/farm" element={<FarmDashboard />} />
        <Route path="/farm/contracts" element={<FarmContractsPage />} />
        <Route path="/farm/contracts/:id/progress" element={<ContractProgressPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
