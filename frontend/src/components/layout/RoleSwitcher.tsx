import { Segmented } from 'antd';
import { useRole, type UserRole } from '@/context/RoleContext';

export function RoleSwitcher() {
  const { role, setRole } = useRole();

  return (
    <Segmented<UserRole>
      value={role}
      onChange={(v) => setRole(v)}
      options={[
        { value: 'farm-owner', label: 'مزرعه‌دار' },
        { value: 'feed-supplier', label: 'تأمین‌کننده' },
      ]}
      size="small"
      style={{ fontSize: 11 }}
    />
  );
}
