import { Layout, Typography, Space, Button } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import { RoleSwitcher } from './RoleSwitcher';
import { useRole } from '@/context/RoleContext';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

interface TopAppBarProps {
  onMenuClick: () => void;
}

export function TopAppBar({ onMenuClick }: TopAppBarProps) {
  const { role } = useRole();

  return (
    <AntHeader
      style={{
        background: '#fff',
        padding: '0 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        height: 48,
        lineHeight: '48px',
      }}
    >
      {/* Right: hamburger */}
      <Button
        type="text"
        icon={<MenuOutlined />}
        onClick={onMenuClick}
        style={{ fontSize: 18 }}
      />

      {/* Center: title */}
      <Text strong style={{ fontSize: 14 }}>
        {role === 'farm-owner' ? 'پنل مزرعه‌دار' : 'پنل تأمین‌کننده'}
      </Text>

      {/* Left: role switcher */}
      <RoleSwitcher />
    </AntHeader>
  );
}
