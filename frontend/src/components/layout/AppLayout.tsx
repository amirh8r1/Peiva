import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import { TopAppBar } from './TopAppBar';
import { BottomNav } from './BottomNav';
import { DesktopLayout } from './DesktopLayout';
import { useIsDesktop } from '@/hooks/useResponsive';

const { Content } = Layout;

export function AppLayout() {
  const isDesktop = useIsDesktop();

  if (isDesktop) return <DesktopLayout />;

  return (
    <Layout style={{ height: '100vh', overflow: 'hidden', maxWidth: 480, margin: '0 auto', boxShadow: '0 0 40px rgba(0,0,0,0.08)' }}>
      <TopAppBar />
      <Content style={{ flex: 1, overflow: 'hidden', padding: '0 12px 12px', display: 'flex', flexDirection: 'column', paddingBottom: 68 }}>
        <Outlet />
      </Content>
      <BottomNav />
    </Layout>
  );
}
