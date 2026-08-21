import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import { TopAppBar } from './TopAppBar';
import { BottomNav } from './BottomNav';
import { DesktopLayout } from './DesktopLayout';
import { PageTransition } from './PageTransition';
import { useIsDesktop } from '@/hooks/useResponsive';
import { SHELL_MOBILE_MAX } from '@/config/layout';
import { pivaTokens } from '@/config/theme';

const { Content } = Layout;

export function AppLayout() {
  const isDesktop = useIsDesktop();

  if (isDesktop) return <DesktopLayout />;

  return (
    <Layout style={{
      height: '100vh',
      overflow: 'hidden',
      maxWidth: SHELL_MOBILE_MAX,
      margin: '0 auto',
      boxShadow: pivaTokens.shadowMobileShell,
    }}>
      <TopAppBar />
      <Content style={{ flex: 1, overflow: 'hidden', padding: '0 12px 12px', display: 'flex', flexDirection: 'column', paddingBottom: 68 }}>
        <PageTransition>
          <Outlet />
        </PageTransition>
      </Content>
      <BottomNav />
    </Layout>
  );
}
