import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { RoleLandingPage } from '@/pages/RoleLandingPage';
import { DashboardPage } from '@/features/farms/pages/Dashboard';
import { CreateChainPage } from '@/features/chains/pages/CreateChainPage';
import { ProposalsListPage } from '@/features/farm-owner/pages/ProposalsListPage';
import { ProposalDetailPage } from '@/features/farm-owner/pages/ProposalDetailPage';
import { CollateralPage } from '@/features/farm-owner/pages/CollateralPage';
import { FarmOwnerContractsPage } from '@/features/farm-owner/pages/ContractsPage';
import { FarmApprovalPage } from '@/features/feed-supplier/pages/FarmApprovalPage';
import { SupplierContractsPage } from '@/features/feed-supplier/pages/ContractsPage';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<RoleLandingPage />} />

      {/* Supplier routes */}
      <Route element={<AppLayout />}>
        <Route path="/supplier" element={<DashboardPage />} />
        <Route path="/supplier/contracts/new" element={<CreateChainPage />} />
        <Route path="/supplier/contracts/:id/farms" element={<FarmApprovalPage />} />
        <Route path="/supplier/contracts" element={<SupplierContractsPage />} />
      </Route>

      {/* Farm owner routes */}
      <Route element={<AppLayout />}>
        <Route path="/farm" element={<DashboardPage />} />
        <Route path="/farm/proposals" element={<ProposalsListPage />} />
        <Route path="/farm/proposals/:id" element={<ProposalDetailPage />} />
        <Route path="/farm/collateral/:id" element={<CollateralPage />} />
        <Route path="/farm/contracts" element={<FarmOwnerContractsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
