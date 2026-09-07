import { theme } from 'antd';
import { formatNumber } from '@/utils/format';
import { pivaType } from '@/config/theme';

export interface ShareSegment {
  key: string;
  label: string;
  percent: number;
  /** رنگ سگمنت — از توکن/متغیر برند بیاید، نه hex پراکنده */
  color: string;
}

interface ShareSplitBarProps {
  segments: ShareSegment[];
}

/**
 * بار تقسیم چندبخشی — نمایش بصری سهم بازیگران از مرغ تولیدی.
 * RTL: اولین فرزند = راست (شروع)؛ سگمنت صفر٪ رندر نمی‌شود.
 */
export function ShareSplitBar({ segments }: ShareSplitBarProps) {
  const { token } = theme.useToken();
  const visible = segments.filter((s) => s.percent > 0);

  return (
    <div>
      <div style={{
        display: 'flex', height: 10, borderRadius: 5, overflow: 'hidden',
        background: token.colorFillSecondary,
      }}>
        {visible.map((s) => (
          <div
            key={s.key}
            title={`${s.label} — ٪${formatNumber(s.percent)}`}
            style={{
              width: `${s.percent}%`,
              background: s.color,
              transition: 'width var(--piva-duration-tab) var(--piva-ease-enter)',
            }}
          />
        ))}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px', marginTop: 8 }}>
        {visible.map((s) => (
          <span key={s.key} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
            <span style={{ fontSize: pivaType.caption.fontSize, color: token.colorTextSecondary }}>
              {s.label} ٪{formatNumber(s.percent)}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
