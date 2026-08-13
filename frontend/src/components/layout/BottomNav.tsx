import { useNavigate, useLocation } from 'react-router-dom';
import { PlusOutlined } from '@ant-design/icons';
import { getNavItems, isNavItemActive } from './navItems';
import type { NavItem } from './navItems';

const FAB = 48;
const NOTCH = 54;
const NAV_H = 50;
const FAB_OFFSET = -16; // هرچه منفی‌تر → FAB پایین‌تر | مثبت → بالاتر

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { items, isSupplier } = getNavItems(location.pathname);
  const fabItem = items.find((item) => item.fab);
  const hasFab = !!fabItem;

  const fabActive = hasFab && location.pathname === fabItem!.path;
  // FAB active = blue (same as nav), inactive = green (distinct action color)
  const fabColor = fabActive ? '#1677ff' : '#389e0d';

  const renderBtn = (item: NavItem) => {
    const active = isNavItemActive(item, location.pathname);
    const color = active ? '#1677ff' : '#8c8c8c';
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
          color,
          transition: 'color 0.2s ease',
        }}
      >
        <span style={{ fontSize: 22, lineHeight: 1 }}>{item.icon}</span>
        <span style={{ fontSize: 11, fontWeight: active ? 600 : 400, lineHeight: 1.4 }}>
          {item.label}
        </span>
      </button>
    );
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: 480,
        zIndex: 100,
      }}
    >
      {/* ── Nav bar ── */}
      <nav
        style={{
          position: 'relative',
          height: NAV_H,
          background: '#fff',
          boxShadow: '0 -2px 12px rgba(0,0,0,0.08)',
          display: 'flex',
          alignItems: 'center',
          paddingBottom: 'env(safe-area-inset-bottom, 0)',
          overflow: 'visible',
        }}
      >
        <div style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          height: '100%',
        }}>
          {renderBtn(items[0])}
          {hasFab ? (
            <>
              <div style={{ width: FAB + 24 }} />
              {renderBtn(items[2])}
            </>
          ) : (
            <>
              {renderBtn(items[1])}
              {renderBtn(items[2])}
            </>
          )}
        </div>

        {/* White circle notch */}
        {hasFab && (
          <div
            style={{
              position: 'absolute',
              top: -NOTCH / 2 + 2,
              left: '50%',
              transform: 'translateX(-50%)',
              width: NOTCH,
              height: NOTCH,
              borderRadius: '50%',
              background: '#fff',
              boxShadow: '0 -1px 4px rgba(0,0,0,0.03) inset',
              zIndex: 1,
            }}
          />
        )}
      </nav>

      {/* ── FAB + Label ── */}
      {hasFab && (
        <div
          style={{
            position: 'absolute',
            bottom: NAV_H - FAB / 2 + FAB_OFFSET,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            zIndex: 3,
          }}
        >
          {/* Circle button */}
          <button
            onClick={() => navigate(fabItem!.path)}
            style={{
              width: FAB,
              height: FAB,
              borderRadius: '50%',
              background: fabColor,
              color: '#fff',
              border: '3px solid #fff',
              boxShadow: fabActive
                ? '0 4px 18px rgba(56,158,13,0.55)'
                : '0 3px 10px rgba(56,158,13,0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background 0.25s ease, box-shadow 0.25s ease',
            }}
          >
            <PlusOutlined style={{ fontSize: 26 }} />
          </button>
          {/* Label below the circle */}
          <span
            style={{
              fontSize: 11,
              fontWeight: fabActive ? 600 : 400,
              color: fabActive ? '#1677ff' : '#389e0d',
              marginTop: -1,
              lineHeight: 1.3,
              transition: 'color 0.25s ease',
              whiteSpace: 'nowrap',
            }}
          >
            {fabItem!.label}
          </span>
        </div>
      )}
    </div>
  );
}
