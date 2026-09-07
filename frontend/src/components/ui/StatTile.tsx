import { theme } from 'antd';
import type { GlobalToken } from 'antd';
import { pivaTokens, pivaType } from '@/config/theme';

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
 * تایل آمار مشترک — اعداد درشت فارسی (امضای بصری سامانه).
 * minWidth:0 داخلی از کلیپ مقادیر بلند در گرید موبایل جلوگیری می‌کند.
 */
export function StatTile({ icon, label, value, tone = 'neutral', direction = 'row', onClick }: StatTileProps) {
  const { token } = theme.useToken();
  const accent = toneColor(token, tone);

  if (direction === 'column') {
    return (
      <div
        onClick={onClick}
        className={onClick ? 'piva-tile-lift' : undefined}
        style={{
          background: toneBg(token, tone),
          border: `1px solid ${token.colorBorderSecondary}`,
          borderRadius: token.borderRadiusLG,
          padding: '16px 12px',
          textAlign: 'center',
          minWidth: 0,
          cursor: onClick ? 'pointer' : 'default',
        }}
      >
        {icon && <span style={{ fontSize: 22, color: accent, display: 'inline-flex' }}>{icon}</span>}
        <span style={{ fontSize: pivaType.statLabel.fontSize, fontWeight: pivaType.statLabel.fontWeight, display: 'block', color: token.colorTextSecondary }}>
          {label}
        </span>
        <span style={{ fontSize: pivaType.statValue.fontSize, fontWeight: pivaType.statValue.fontWeight, color: accent, lineHeight: 1.2 }}>
          {value}
        </span>
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
        <span style={{ fontSize: pivaType.statLabel.fontSize, fontWeight: pivaType.statLabel.fontWeight, display: 'block', color: token.colorTextSecondary }}>{label}</span>
        <span style={{ fontSize: pivaType.body.fontSize, fontWeight: 600, color: token.colorText }}>{value}</span>
      </div>
    </div>
  );
}
