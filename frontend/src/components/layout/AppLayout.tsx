import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

const { Content } = Layout;

export function AppLayout() {
  return (
    <Layout style={{ height: '97vh', overflow: 'hidden' }}>
      <Sidebar />
      <Layout
        style={{
          marginRight: 240,
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Header />
        <Content
          style={{
            flex: 1,
            overflow: 'hidden',
            padding: '0 24px 16px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
