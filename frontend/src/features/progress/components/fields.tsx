import { InputNumber, Input, Select, DatePicker, Typography } from 'antd';
import type { InputNumberProps, InputProps, SelectProps, DatePickerProps } from 'antd';
import { numberFieldProps, jalaliDatePickerProps } from '@/utils/fieldProps';
import { pivaType } from '@/config/theme';
import { useIsDesktop } from '@/hooks/useResponsive';

const { Text } = Typography;

/**
 * فیلدهای مشترک با label بالا و واحد/hint — منبع واحد فرم‌های فلو پیگیری (DRY).
 * همه pass-through هستند تا antd Form.Item بتواند value/onChange تزریق کند؛
 * label عمداً داخل خود فیلد است (نه روی Form.Item) تا فرم‌های دستی هم یکسان بمانند.
 * سایز ریسپانسیو: موبایل large (لمسی)، دسکتاپ middle (جمع‌وجور).
 */

export function FieldLabel({ children }: { children: React.ReactNode }) {
  return <Text type="secondary" style={{ fontSize: pivaType.body.fontSize, display: 'block', marginBottom: 6 }}>{children}</Text>;
}

export function FieldHint({ children }: { children: React.ReactNode }) {
  return <Text type="secondary" style={{ fontSize: pivaType.caption.fontSize, display: 'block', margin: '-2px 0 10px' }}>{children}</Text>;
}

/** InputNumber با واحد addonAfter (قطعه/کیلوگرم). */
export function NumberField({ label, unit, hint, ...rest }: { label: string; unit: string; hint?: string } & InputNumberProps) {
  const isDesktop = useIsDesktop();
  return (
    <>
      <FieldLabel>{label}</FieldLabel>
      <InputNumber addonAfter={unit} {...numberFieldProps} size={isDesktop ? 'middle' : 'large'} style={{ width: '100%' }} {...rest} />
      {hint && <FieldHint>{hint}</FieldHint>}
    </>
  );
}

export function TextField({ label, hint, ...rest }: { label: string; hint?: string } & InputProps) {
  const isDesktop = useIsDesktop();
  return (
    <>
      <FieldLabel>{label}</FieldLabel>
      <Input size={isDesktop ? 'middle' : 'large'} style={{ width: '100%' }} {...rest} />
      {hint && <FieldHint>{hint}</FieldHint>}
    </>
  );
}

export function SelectField({ label, hint, ...rest }: { label: string; hint?: string } & SelectProps) {
  const isDesktop = useIsDesktop();
  return (
    <>
      <FieldLabel>{label}</FieldLabel>
      <Select size={isDesktop ? 'middle' : 'large'} style={{ width: '100%' }} {...rest} />
      {hint && <FieldHint>{hint}</FieldHint>}
    </>
  );
}

/** DatePicker جلالی — مقدار در Form با dayjs است؛ در onFinish با .format('YYYY/MM/DD') ذخیره می‌شود.
 *  عرض جمع‌وجور در دسکتاپ (انتخابگر تاریخ لازم نیست تمام‌عرض باشد). */
export function DateField({ label, hint, ...rest }: { label: string; hint?: string } & DatePickerProps) {
  const isDesktop = useIsDesktop();
  return (
    <>
      <FieldLabel>{label}</FieldLabel>
      <DatePicker
        {...jalaliDatePickerProps}
        size={isDesktop ? 'middle' : 'large'}
        style={{ width: isDesktop ? 280 : '100%' }}
        {...rest}
      />
      {hint && <FieldHint>{hint}</FieldHint>}
    </>
  );
}
