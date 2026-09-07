import { theme } from 'antd';
import { pivaTokens } from '@/config/theme';

interface LogoMarkProps {
  size?: number;
}

/**
 * لوگومارک پیوا — جوانه در تایل گرد با گرادیان برند.
 * فقط مکان‌های هویت برند (هدر دسکتاپ، لندینگ)؛ همه‌جا یک شکل واحد.
 */
export function LogoMark({ size = 36 }: LogoMarkProps) {
  const { token } = theme.useToken();
  return (
    <span
      aria-hidden
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.28,
        background: `linear-gradient(135deg, ${token.colorPrimary}, ${pivaTokens.brandDeep})`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <svg width={size * 0.56} height={size * 0.56} viewBox="0 0 32 32" fill="none">
        {/* ساقه + بذر */}
        <path d="M16 27V17" stroke={pivaTokens.onPrimary} strokeWidth="2.6" strokeLinecap="round" />
        <circle cx="16" cy="27" r="2.2" fill={pivaTokens.onPrimary} />
        {/* دو برگ جوانه */}
        <path d="M16 17c-5.4-.4-9.4-4.4-8-10.2C13.8 6.4 17 9.9 16 17Z" fill={pivaTokens.onPrimary} />
        <path d="M16 17c5.4-.4 9.4-4.4 8-10.2C18.2 6.4 15 9.9 16 17Z" fill={pivaTokens.onPrimary} />
      </svg>
    </span>
  );
}
