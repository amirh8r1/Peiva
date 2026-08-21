import type { CSSProperties, ReactNode } from 'react';
import { useIsDesktop } from '@/hooks/useResponsive';
import { CONTENT_PAD_MOBILE, CONTENT_PAD_DESKTOP } from '@/config/layout';

interface PageFrameProps {
  /** بالای اسکرول‌منطقه (معمولاً PageHeader) — flexShrink 0 */
  header?: ReactNode;
  children: ReactNode;
  /** تغییر این کلید اسکرول‌کانتینر را remount و انیمیشن ورود را replay می‌کند (گام ویزارد، فرم↔تأیید) */
  remountKey?: string | number;
  mobilePaddingBottom?: number;
  desktopPaddingBottom?: number;
  /** روی اسکرول‌کانتینر اعمال می‌شود (مثلاً centeredForm) */
  style?: CSSProperties;
}

/**
 * قاب استاندارد صفحه: ستون flex ارتفاع‌محدود + اسکرول‌کانتینر با فاصله کف ریسپانسیو.
 * فاصله کف موبایل کوچک است چون خود Content شل از قبل ۶۸px برای BottomNav جا گذاشته.
 */
export function PageFrame({
  header,
  children,
  remountKey,
  mobilePaddingBottom = CONTENT_PAD_MOBILE,
  desktopPaddingBottom = CONTENT_PAD_DESKTOP,
  style,
}: PageFrameProps) {
  const isDesktop = useIsDesktop();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      {header}
      <div
        key={remountKey}
        className="page-enter"
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          paddingBottom: isDesktop ? desktopPaddingBottom : mobilePaddingBottom,
          ...style,
        }}
      >
        {children}
      </div>
    </div>
  );
}
