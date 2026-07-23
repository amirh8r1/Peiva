import { Routes, Route } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { DashboardPage } from '@/features/farms/pages/Dashboard';
import { CreateChainPage } from '@/features/chains/pages/CreateChainPage';
import { ChainDetailPage } from '@/features/chains/pages/ChainDetailPage';

export function AppRouter() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/chains/new" element={<CreateChainPage />} />
        <Route path="/chains/:id" element={<ChainDetailPage />} />
      </Route>
    </Routes>
  );
}
