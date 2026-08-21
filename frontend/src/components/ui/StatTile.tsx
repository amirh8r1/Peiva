import { theme } from 'antd';
import type { GlobalToken } from 'antd';
import { pivaTokens } from '@/config/theme';

type StatTileTone = 'neutral' | 'success' | 'info' | 'warning' | 'purple';

interface StatTileProps {
  icon?: React.ReactNode;
  label: string;
  value: React.ReactNode;
  /** رنگ آیکون/مقدار و پس‌زمینه (در حالت column) */
  tone?: StatTileTone;
  /** row = آیکون + برچسب/مقدار کنار هم (خلاصه‌ها) | column = برچسب روی مقدار (کارت آمار) */
  direction?: 'row' | 'column';
  onClick?: () => void;
}

const toneColor = (token: GlobalToken, tone: StatTileTone): string => {
  switch (tone) {
    case 'success': return token.colorPrimary;
    case 'info': return token.colorInfo;
    case 'warning': return pivaTokens.orange;
    case 'purple': return pivaTokens.purple;
    default: return token.colorText;
  }
};

const toneBg = (token: GlobalToken, tone: StatTileTone): string => {
  switch (tone) {
    case 'success': return token.colorSuccessBg;
    case 'info': return token.colorInfoBg;
    case 'warning': return token.colorWarningBg;
    default: return token.colorBgContainer;
  }
};

/**
 * تایل آمار مشترک — جایگزین summaryItemStyle تکراری و کارت‌های آمار دستی.
 * minWidth:0 داخلی از کلیپ مقادیر بلند در گرید موبایل جلوگیری می‌کند.
 */
export function StatTile({ icon, label, value, tone = 'neutral', direction = 'row', onClick }: StatTileProps) {
  const { token } = theme.useToken();
  const accent = toneColor(token, tone);

  if (direction === 'column') {
    return (
      <div
        onClick={onClick}
        style={{
          background: toneBg(token, tone),
          border: `1px solid ${token.colorBorderSecondary}`,
          borderRadius: token.borderRadius,
          padding: '8px 12px',
          textAlign: 'center',
          minWidth: 0,
          cursor: onClick ? 'pointer' : 'default',
        }}
      >
        <span style={{ fontSize: 11, display: 'block', color: token.colorTextSecondary }}>{label}</span>
        <span style={{ fontSize: 18, fontWeight: 700, color: accent }}>{value}</span>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        background: token.colorFillSecondary,
        borderRadius: token.borderRadius,
        padding: '12px 16px',
        minWidth: 0,
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      {icon && <span style={{ fontSize: 18, color: accent, flexShrink: 0 }}>{icon}</span>}
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: 11, display: 'block', color: token.colorTextSecondary }}>{label}</span>
        <span style={{ fontSize: 13, color: token.colorText }}>{value}</span>
      </div>
    </div>
  );
}
