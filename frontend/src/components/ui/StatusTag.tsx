import { Tag, theme } from 'antd';
import type { GlobalToken } from 'antd';

export type StatusTone = 'neutral' | 'info' | 'warning' | 'success' | 'error';

const toneOf = (token: GlobalToken, tone: StatusTone) => {
  switch (tone) {
    case 'info': return { color: token.colorInfo, bg: token.colorInfoBg };
    case 'warning': return { color: token.colorWarning, bg: token.colorWarningBg };
    case 'success': return { color: token.colorSuccess, bg: token.colorSuccessBg };
    case 'error': return { color: token.colorError, bg: token.colorErrorBg };
    default: return { color: token.colorTextTertiary, bg: token.colorFillSecondary };
  }
};

/**
 * بج وضعیت توکن‌محور — tint نرم semantic با متن همرنگ، pill کامل.
 * جایگزین Tag های preset دار antd که در تم تیره خوانایی کافی ندارند.
 */
export function StatusTag({ tone = 'neutral', children }: { tone?: StatusTone; children: React.ReactNode }) {
  const { token } = theme.useToken();
  const t = toneOf(token, tone);
  return (
    <Tag style={{
      margin: 0,
      borderRadius: 999,
      border: 'none',
      color: t.color,
      background: t.bg,
      fontWeight: 500,
      paddingInline: 10,
    }}>
      {children}
    </Tag>
  );
}
