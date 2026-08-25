/**
 * Props مشترک فیلدهای فرم — منبع واحد InputNumber و DatePicker جلالی.
 * (انتقال از progress.utils — مصرف‌کننده: features/progress/components/fields.tsx و فرم‌های جدید.)
 */
import { parsePersianNumber, formatNumber, toPersianDigits } from '@/utils/format';
import { jalaliDatePickerLocale } from '@/utils/jalaliDatePickerLocale';

// ── InputNumber مشترک ──

export const numberFieldProps = {
  size: 'large' as const,
  style: { width: '100%', marginBottom: 12, borderRadius: 10 },
  parser: (v: string | undefined) => parsePersianNumber(v || ''),
  formatter: (v: string | number | undefined) => (v != null ? formatNumber(Number(v)) : ''),
};

// ── DatePicker جلالی مشترک ──

export const jalaliDatePickerProps = {
  locale: jalaliDatePickerLocale,
  size: 'large' as const,
  style: { width: '100%', borderRadius: 10 } as React.CSSProperties,
  placement: 'bottomLeft' as const,
  showToday: false,
  popupAlign: { offset: [0, 4] as [number, number], overflow: { adjustX: true, adjustY: false } },
  format: (d: unknown) => toPersianDigits((d as { format: (f: string) => string }).format('YYYY/MM/DD')),
};
