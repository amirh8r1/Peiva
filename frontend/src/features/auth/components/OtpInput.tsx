import { useEffect, useRef, type ClipboardEvent, type FocusEvent, type KeyboardEvent } from 'react';
import { theme } from 'antd';
import { toEnglishDigits, toPersianDigits } from '@/utils/format';

interface OtpInputProps {
  /** تعداد جعبه‌ها (پیش‌فرض ۵) */
  length?: number;
  value: string;
  onChange: (value: string) => void;
  /** فراخوانی وقتی همه جعبه‌ها پر شد */
  onComplete?: (value: string) => void;
  /** حالت خطا (بوردر قرمز همه جعبه‌ها) */
  error?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
}

/**
 * ورودی OTP چندجعبه‌ای — یک عدد در هر جعبه، پرش خودکار به جعبه بعد با تایپ،
 * بازگشت به جعبه قبلی با Backspace روی جعبه خالی، پشتیبانی paste،
 * ورود/چسباندن اعداد فارسی هم مجاز است. دکمه Enter در جعبه آخر = onComplete.
 * LTR: اولین جعبه سمت چپ است (هم‌راستا با شماره همراه).
 */
export function OtpInput({ length = 5, value, onChange, onComplete, error, disabled, autoFocus = true }: OtpInputProps) {
  const { token } = theme.useToken();
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  // آینه مقدار در ref — onFocus در لحظه فوکوس برنامه‌ریزی‌شده closure تازه ندارد
  // و باید آخرین مقدار را ببیند تا فوکوس را اشتباهاً به جعبه اول برنگرداند.
  const valueRef = useRef(value);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    if (autoFocus) refs.current[0]?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const focusAt = (i: number) => refs.current[Math.max(0, Math.min(length - 1, i))]?.focus();

  /** ثبت مقدار + همگام‌سازی ref قبل از هر فوکوس برنامه‌ریزی‌شده. */
  const commit = (next: string) => {
    valueRef.current = next;
    onChange(next);
  };

  /** جلوگیری از حفره وسط: فوکوس روی جعبه خالیِ بعد از آخرین رقم می‌نشیند. */
  const handleFocus = (e: FocusEvent<HTMLInputElement>, i: number) => {
    if (i > valueRef.current.length) {
      focusAt(valueRef.current.length);
      return;
    }
    e.target.select();
  };

  const setDigit = (i: number, digit: string) => {
    const next = i >= value.length
      ? value + digit
      : value.slice(0, i) + digit + value.slice(i + 1);
    commit(next);
    if (next.length === length) {
      onComplete?.(next);
    } else {
      focusAt(i + 1);
    }
  };

  const handleChange = (i: number, raw: string) => {
    const digits = toEnglishDigits(raw).replace(/\D/g, '');
    if (digits) setDigit(i, digits[digits.length - 1]);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, i: number) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (value[i]) {
        commit(value.slice(0, i) + value.slice(i + 1));
        focusAt(i);
      } else if (i > 0) {
        commit(value.slice(0, i - 1) + value.slice(i));
        focusAt(i - 1);
      }
      return;
    }
    // در LTR پیکان راست = جعبه بعدی و پیکان چپ = قبلی
    if (e.key === 'ArrowLeft') { focusAt(i - 1); return; }
    if (e.key === 'ArrowRight') { focusAt(i + 1); return; }
    if (e.key === 'Enter' && value.length === length) onComplete?.(value);
  };

  const handlePaste = (e: ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const digits = toEnglishDigits(e.clipboardData.getData('text')).replace(/\D/g, '').slice(0, length);
    if (!digits) return;
    commit(digits);
    if (digits.length === length) onComplete?.(digits);
    else focusAt(digits.length);
  };

  const boxBase: React.CSSProperties = {
    // انعطاف‌پذیر: در گوشی‌های باریک جمع می‌شود تا هرگز از صفحه بیرون نزند
    flex: '1 1 0',
    width: '100%',
    maxWidth: 56,
    minWidth: 0,
    height: 56,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: 800,
    borderRadius: token.borderRadius,
    border: `1.5px solid ${error ? token.colorError : token.colorBorder}`,
    background: token.colorBgContainer,
    color: token.colorText,
    outline: 'none',
    caretColor: token.colorPrimary,
    transition: 'border-color var(--piva-duration-tab) var(--piva-ease-enter), box-shadow var(--piva-duration-tab) var(--piva-ease-enter)',
  };

  return (
    <div dir="ltr" onPaste={handlePaste} style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
      {Array.from({ length }, (_, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          className="piva-otp-box"
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={1}
          value={value[i] ? toPersianDigits(value[i]) : ''}
          disabled={disabled}
          aria-label={`رقم ${i + 1} کد تأیید`}
          onFocus={(e) => handleFocus(e, i)}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          style={boxBase}
        />
      ))}
    </div>
  );
}
