import { Layout, Typography } from 'antd';
import { useLocation } from 'react-router-dom';
import { panelTitle, LogoutButton } from './navItems';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

export function TopAppBar() {
  const location = useLocation();

  return (
    <AntHeader style={{
      background: '#fff', padding: '0 12px', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
      position: 'sticky', top: 0, zIndex: 10, height: 48, lineHeight: '48px',
    }}>
      <div style={{ width: 48 }} />
      <Text strong style={{ fontSize: 14 }}>
        {panelTitle(location.pathname)}
      </Text>
      <LogoutButton />
    </AntHeader>
  );
}
