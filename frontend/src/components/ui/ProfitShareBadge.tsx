import { theme } from 'antd';
import { formatNumber } from '@/utils/format';

interface ProfitShareBadgeProps {
  percent: number;
  size?: 'sm' | 'lg';
  /** محتوای اختیاری زیر درصد (مثلاً اسلایدر تنظیم) */
  children?: React.ReactNode;
}

/**
 * بج گرادیان سبز درصد تسهیم سود — امضای بصری سامانه.
 * پس‌زمینه/بوردر/درصد از متغیرهای CSS می‌آیند تا در تم تیره نسخه شیشه‌ای درخشان
 * رندر شود (اسلایدر و متن روی پس‌زمینه مات تیره خوانا نمی‌ماندند)؛
 * لیبل از توکن antd است که خودش با تم سوییچ می‌شود.
 */
export function ProfitShareBadge({ percent, size = 'lg', children }: ProfitShareBadgeProps) {
  const { token } = theme.useToken();

  return (
    <div style={{
      background: 'var(--piva-profit-badge-bg)',
      border: '2px solid var(--piva-profit-badge-border)',
      borderRadius: token.borderRadiusLG,
      padding: size === 'lg' ? '16px 20px' : '12px 16px',
    }}>
      <span style={{ fontSize: 12, display: 'block', color: token.colorTextSecondary }}>
        حداقل درصد تسهیم مزرعه‌دار
      </span>
      <div style={{ textAlign: 'center' }}>
        <span style={{ fontSize: size === 'lg' ? 28 : 26, fontWeight: 700, color: 'var(--piva-profit-badge-text)' }}>
          ٪{formatNumber(percent)}
        </span>
      </div>
      {children}
    </div>
  );
}

