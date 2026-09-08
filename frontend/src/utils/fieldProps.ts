/**
 * Props مشترک فیلدهای فرم — منبع واحد InputNumber و DatePicker جلالی.
 * (انتقال از progress.utils — مصرف‌کننده: features/progress/components/fields.tsx و فرم‌های جدید.)
 */
import { parsePersianNumber, formatNumber, toPersianDigits } from '@/utils/format';
import { jalaliDatePickerLocale } from '@/utils/jalaliDatePickerLocale';

// ── InputNumber مشترک ──
// سایز عمدی اینجا نیست — کامپوننت‌های فیلد (fields.tsx) ریسپانسیو ست می‌کنند (موبایل large، دسکتاپ middle)

export const numberFieldProps = {
  style: { width: '100%', marginBottom: 12 },
  parser: (v: string | undefined) => parsePersianNumber(v || ''),
  formatter: (v: string | number | undefined) => (v != null ? formatNumber(Number(v)) : ''),
};

// ── DatePicker جلالی مشترک ──

export const jalaliDatePickerProps = {
  locale: jalaliDatePickerLocale,
  style: { width: '100%' } as React.CSSProperties,
  placement: 'bottomLeft' as const,
  showToday: false,
  popupAlign: { offset: [0, 4] as [number, number], overflow: { adjustX: true, adjustY: false } },
  format: (d: unknown) => toPersianDigits((d as { format: (f: string) => string }).format('YYYY/MM/DD')),
  // پاپ‌آپ داخل والد تریگر رندر شود — در اورلی پورتال‌شده ویزارد، transform باقی‌مانده
  // موقعیت fixed پاپ‌آپ را می‌شکند و تقویم بیرون صفحه باز می‌شود.
  getPopupContainer: (trigger: HTMLElement) => (trigger.parentElement ?? document.body) as HTMLElement,
};
