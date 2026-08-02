import { useState } from 'react';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import { TopAppBar } from './TopAppBar';
import { AppDrawer } from './AppDrawer';

const { Content } = Layout;

export function AppLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <Layout style={{ height: '100vh', overflow: 'hidden', maxWidth: 480, margin: '0 auto', boxShadow: '0 0 40px rgba(0,0,0,0.08)' }}>
      <TopAppBar onMenuClick={() => setDrawerOpen(true)} />
      <AppDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <Content style={{ flex: 1, overflow: 'hidden', padding: '0 12px 12px', display: 'flex', flexDirection: 'column' }}>
        <Outlet />
      </Content>
    </Layout>
  );
}
