import type { CSSProperties, ReactNode } from 'react';
import { Button, theme } from 'antd';
import { useIsDesktop } from '@/hooks/useResponsive';
import { centeredCTA } from '@/utils/responsive';

interface PrimaryCTAProps {
  children: ReactNode;
  onClick?: () => void;
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  height?: number;
  /** false برای قرارگیری داخل ردیف‌های flex (مثل فوتـر ویزارد) که نباید وسط‌چین شوند */
  centered?: boolean;
  /** submit داخل فرم‌ها */
  htmlType?: 'submit';
  style?: CSSProperties;
}

/**
 * دکمه CTA استاندارد: primary + large + block + وزن ۶۰۰، وسط‌چین در دسکتاپ (حداکثر ۵۲۰px).
 * ارتفاع و ظاهر CTA ها را در همه صفحات یکسان می‌کند.
 */
export function PrimaryCTA({ children, onClick, loading, disabled, icon, height = 48, centered = true, htmlType, style }: PrimaryCTAProps) {
  const { token } = theme.useToken();
  const isDesktop = useIsDesktop();

  return (
    <Button
      type="primary"
      size="large"
      block
      icon={icon}
      loading={loading}
      disabled={disabled}
      onClick={onClick}
      htmlType={htmlType}
      style={{
        height,
        borderRadius: token.borderRadius,
        fontSize: 15,
        fontWeight: 600,
        ...(centered ? centeredCTA(isDesktop) : {}),
        ...style,
      }}
    >
      {children}
    </Button>
  );
}
