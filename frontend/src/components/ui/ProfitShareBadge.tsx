import { theme } from 'antd';
import { formatNumber } from '@/utils/format';
import { pivaType } from '@/config/theme';

interface ProfitShareBadgeProps {
  percent: number;
  size?: 'sm' | 'lg';
  /** لیبل بالای درصد — پیش‌فرض: «حداقل درصد تسهیم مزرعه‌دار» (فلو قدیمی) */
  label?: React.ReactNode;
  /** محتوای اختیاری زیر درصد (مثلاً اسلایدر تنظیم) */
  children?: React.ReactNode;
}

/**
 * پنل سهم — امضای شفافیت سامانه: درصد درشت + نوار تقسیم سهم (سهم مشارکت‌کننده سبز،
 * بقیه خنثی) تا تقسیم واقعی در یک نگاه دیده شود.
 * پس‌زمینه/بوردر/درصد از متغیرهای CSS می‌آیند تا در تم تیره نسخه شیشه‌ای درخشان
 * رندر شود (اسلایدر و متن روی پس‌زمینه مات تیره خوانا نمی‌مانند).
 */
export function ProfitShareBadge({ percent, size = 'lg', label, children }: ProfitShareBadgeProps) {
  const { token } = theme.useToken();
  const pct = Math.max(0, Math.min(100, percent));
  const shareText = 'var(--piva-profit-badge-text)';

  return (
    <div style={{
      background: 'var(--piva-profit-badge-bg)',
      border: '1px solid var(--piva-profit-badge-border)',
      borderRadius: token.borderRadiusLG,
      padding: size === 'lg' ? '16px 20px' : '12px 16px',
    }}>
      <span style={{ fontSize: pivaType.secondary.fontSize, display: 'block', color: token.colorTextSecondary, textAlign: 'center' }}>
        {label ?? 'حداقل درصد تسهیم مزرعه‌دار'}
      </span>
      <div style={{ textAlign: 'center', marginTop: 4 }}>
        <span style={{ fontSize: size === 'lg' ? 32 : 28, fontWeight: 800, color: shareText, lineHeight: 1.3 }}>
          ٪{formatNumber(percent)}
        </span>
      </div>

      {/* نوار تقسیم سهم — سبز = سهم مشارکت‌کننده (شروع در RTL = راست) */}
      <div style={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', marginTop: 10, background: token.colorFillSecondary }}>
        <div style={{
          width: `${pct}%`,
          background: shareText,
          transition: 'width var(--piva-duration-tab) var(--piva-ease-enter)',
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
        <span style={{ fontSize: pivaType.caption.fontSize, color: token.colorTextSecondary }}>
          مشارکت‌کننده ٪{formatNumber(pct)}
        </span>
        <span style={{ fontSize: pivaType.caption.fontSize, color: token.colorTextTertiary }}>
          مزرعه‌دار ٪{formatNumber(100 - pct)}
        </span>
      </div>

      {children}
    </div>
  );
}
