import { theme } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import { pivaTokens, pivaType } from '@/config/theme';
import { toPersianDigits } from '@/utils/format';

export interface StepperItem {
  label: string;
  status: 'idle' | 'current' | 'done' | 'error';
}

/**
 * استپر افقی سفارشی — دایره با تیک/شماره فارسی و اتصال‌دهنده نرم.
 * جایگزین Steps پیش‌فرض antd (ظاهر قالب اداری). RTL: ترتیب DOM = راست→چپ.
 * تغییر وضعیت با ترنزیشن ۱۵۰ms (توکن تب).
 */
export function Stepper({ items }: { items: StepperItem[] }) {
  const { token } = theme.useToken();

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start' }}>
      {items.map((item, i) => {
        const isDone = item.status === 'done';
        const isError = item.status === 'error';
        const isCurrent = item.status === 'current';
        const circleBg = isDone
          ? token.colorPrimary
          : isError
            ? token.colorErrorBg
            : isCurrent
              ? token.colorPrimaryBg
              : token.colorFillSecondary;
        const circleColor = isDone
          ? pivaTokens.onPrimary
          : isError
            ? token.colorError
            : isCurrent
              ? token.colorPrimary
              : token.colorTextTertiary;
        return (
          <div key={item.label} style={{ display: 'flex', alignItems: 'flex-start', flex: i < items.length - 1 ? 1 : undefined, minWidth: 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              <span style={{
                width: 28, height: 28, borderRadius: '50%',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                background: circleBg, color: circleColor,
                fontSize: 12, fontWeight: 700,
                border: isCurrent ? `1px solid ${token.colorPrimary}` : undefined,
                transition: `background-color var(--piva-duration-tab) var(--piva-ease-enter), color var(--piva-duration-tab) var(--piva-ease-enter)`,
              }}>
                {isDone ? <CheckOutlined /> : isError ? '!' : toPersianDigits(String(i + 1))}
              </span>
              <span style={{
                fontSize: pivaType.caption.fontSize,
                fontWeight: isCurrent ? 600 : 400,
                color: isCurrent ? token.colorText : token.colorTextSecondary,
                textAlign: 'center',
                maxWidth: 84,
              }}>
                {item.label}
              </span>
            </div>
            {i < items.length - 1 && (
              <div style={{
                flex: 1, height: 2, marginTop: 13, marginInline: 8, borderRadius: 2,
                background: isDone ? token.colorPrimary : token.colorBorderSecondary,
                transition: `background-color var(--piva-duration-tab) var(--piva-ease-enter)`,
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}
