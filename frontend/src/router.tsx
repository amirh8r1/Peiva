import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { DashboardPage } from '@/features/farms/pages/Dashboard';
import { CreateChainPage } from '@/features/chains/pages/CreateChainPage';
import { ChainDetailPage } from '@/features/chains/pages/ChainDetailPage';
import { ProposalsListPage } from '@/features/farm-owner/pages/ProposalsListPage';
import { ProposalDetailPage } from '@/features/farm-owner/pages/ProposalDetailPage';
import { CollateralPage } from '@/features/farm-owner/pages/CollateralPage';
import { FarmOwnerContractsPage } from '@/features/farm-owner/pages/ContractsPage';
import { ContractTermsPage } from '@/features/feed-supplier/pages/ContractTermsPage';
import { FarmApprovalPage } from '@/features/feed-supplier/pages/FarmApprovalPage';
import { SupplierContractsPage } from '@/features/feed-supplier/pages/ContractsPage';
import { useRole } from '@/context/RoleContext';

function RoleAwareContractsPage() {
  const { role } = useRole();
  return role === 'farm-owner' ? <FarmOwnerContractsPage /> : <SupplierContractsPage />;
}

export function AppRouter() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/proposals" element={<ProposalsListPage />} />
        <Route path="/proposals/:id" element={<ProposalDetailPage />} />
        <Route path="/proposals/:id/collateral" element={<CollateralPage />} />
        <Route path="/chains/new" element={<CreateChainPage />} />
        <Route path="/chains/:id" element={<ChainDetailPage />} />
        <Route path="/chains/:id/contract" element={<ContractTermsPage />} />
        <Route path="/chains/:id/farms" element={<FarmApprovalPage />} />
        <Route path="/contracts" element={<RoleAwareContractsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
