import { useNavigate, useLocation } from 'react-router-dom';
import { HomeOutlined, FileTextOutlined, PlusCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';

interface NavItem {
  key: string;
  icon: React.ReactNode;
  label: string;
  path: string;
}

const supplierItems: NavItem[] = [
  { key: '/supplier', icon: <HomeOutlined />, label: 'داشبورد', path: '/supplier' },
  { key: '/supplier/contracts/new', icon: <PlusCircleOutlined />, label: 'قرارداد جدید', path: '/supplier/contracts/new' },
  { key: '/supplier/contracts', icon: <FileTextOutlined />, label: 'قراردادها', path: '/supplier/contracts' },
];

const farmItems: NavItem[] = [
  { key: '/farm', icon: <HomeOutlined />, label: 'داشبورد', path: '/farm' },
  { key: '/farm/proposals', icon: <FileTextOutlined />, label: 'پیشنهادات', path: '/farm/proposals' },
  { key: '/farm/contracts', icon: <CheckCircleOutlined />, label: 'جاری', path: '/farm/contracts' },
];

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const isSupplier = location.pathname.startsWith('/supplier');
  const items = isSupplier ? supplierItems : farmItems;

  const isActive = (item: NavItem) => {
    const p = location.pathname;
    if (item.path === '/supplier') return p === '/supplier';
    if (item.path === '/farm') return p === '/farm';
    // /supplier/contracts should NOT match /supplier/contracts/new
    if (item.path === '/supplier/contracts') return p.startsWith('/supplier/contracts') && p !== '/supplier/contracts/new';
    // Other items use prefix match for sub-routes (e.g. /farm/proposals/:id highlights proposals)
    return p.startsWith(item.path);
  };

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: 480,
        height: 56,
        background: '#fff',
        borderTop: '1px solid #f0f0f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 100,
        paddingBottom: 'env(safe-area-inset-bottom, 0)',
        boxShadow: '0 -2px 8px rgba(0,0,0,0.06)',
      }}
    >
      {items.map((item) => {
        const active = isActive(item);
        return (
          <button
            key={item.key}
            onClick={() => navigate(item.path)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px 12px',
              minWidth: 80,
              color: active ? '#1677ff' : '#8c8c8c',
              transition: 'color 0.2s ease',
            }}
          >
            <span style={{ fontSize: 22, lineHeight: 1 }}>{item.icon}</span>
            <span style={{ fontSize: 11, fontWeight: active ? 600 : 400, lineHeight: 1.4 }}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
