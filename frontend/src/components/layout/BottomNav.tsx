import { useNavigate, useLocation } from 'react-router-dom';
import { PlusOutlined } from '@ant-design/icons';
import { theme } from 'antd';
import { getNavItems, isNavItemActive } from './navItems';
import type { NavItem } from './navItems';
import { SHELL_MOBILE_MAX, FAB, NOTCH, NAV_H, FAB_OFFSET } from '@/config/layout';
import { pivaTokens } from '@/config/theme';

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = theme.useToken();
  const { items } = getNavItems(location.pathname);
  const fabItem = items.find((item) => item.fab);
  const hasFab = !!fabItem;

  const fabActive = hasFab && location.pathname === fabItem!.path;
  // FAB فعال = آبی (همان ناوبری)، غیرفعال = سبز (رنگ اکشن متمایز)
  const fabColor = fabActive ? token.colorInfo : token.colorPrimary;

  const renderBtn = (item: NavItem) => {
    const active = isNavItemActive(item, location.pathname);
    const color = active ? token.colorInfo : token.colorTextSecondary;
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
        maxWidth: SHELL_MOBILE_MAX,
        zIndex: 100,
      }}
    >
      {/* ── Nav bar ── */}
      <nav
        style={{
          position: 'relative',
          height: NAV_H,
          background: token.colorBgContainer,
          boxShadow: pivaTokens.shadowBottomNav,
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
          {/* رندر جنریک: آیتم FAB جای خودش اسپیسر می‌گیرد — با ۲ یا ۳ آیتم کار می‌کند */}
          {items.map((item) => (
            item.fab
              ? <div key={item.key} style={{ width: FAB + 24 }} />
              : renderBtn(item)
          ))}
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
              background: token.colorBgContainer,
              boxShadow: pivaTokens.shadowNotchInset,
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
              color: token.colorTextLightSolid,
              border: `3px solid ${token.colorBgContainer}`,
              boxShadow: fabActive ? pivaTokens.shadowFabActive : pivaTokens.shadowFabIdle,
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
              color: fabActive ? token.colorInfo : token.colorPrimary,
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
