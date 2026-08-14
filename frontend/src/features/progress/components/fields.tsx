import { InputNumber, Input, Select, DatePicker, Typography } from 'antd';
import type { InputNumberProps, InputProps, SelectProps, DatePickerProps } from 'antd';
import { numberFieldProps, jalaliDatePickerProps } from '../utils/progress.utils';

const { Text } = Typography;

/**
 * فیلدهای مشترک با label بالا و واحد/hint — منبع واحد فرم‌های فلو پیگیری (DRY).
 * همه pass-through هستند تا antd Form.Item بتواند value/onChange تزریق کند؛
 * label عمداً داخل خود فیلد است (نه روی Form.Item) تا فرم‌های دستی هم یکسان بمانند.
 */

export function FieldLabel({ children }: { children: React.ReactNode }) {
  return <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 6 }}>{children}</Text>;
}

export function FieldHint({ children }: { children: React.ReactNode }) {
  return <Text type="secondary" style={{ fontSize: 11, display: 'block', margin: '-2px 0 10px' }}>{children}</Text>;
}

/** InputNumber با واحد addonAfter (قطعه/کیلوگرم). */
export function NumberField({ label, unit, hint, ...rest }: { label: string; unit: string; hint?: string } & InputNumberProps) {
  return (
    <>
      <FieldLabel>{label}</FieldLabel>
      <InputNumber addonAfter={unit} {...numberFieldProps} style={{ width: '100%', borderRadius: 10 }} {...rest} />
      {hint && <FieldHint>{hint}</FieldHint>}
    </>
  );
}

export function TextField({ label, hint, ...rest }: { label: string; hint?: string } & InputProps) {
  return (
    <>
      <FieldLabel>{label}</FieldLabel>
      <Input size="large" style={{ width: '100%', borderRadius: 10 }} {...rest} />
      {hint && <FieldHint>{hint}</FieldHint>}
    </>
  );
}

export function SelectField({ label, hint, ...rest }: { label: string; hint?: string } & SelectProps) {
  return (
    <>
      <FieldLabel>{label}</FieldLabel>
      <Select size="large" style={{ width: '100%', borderRadius: 10 }} {...rest} />
      {hint && <FieldHint>{hint}</FieldHint>}
    </>
  );
}

/** DatePicker جلالی — مقدار در Form با dayjs است؛ در onFinish با .format('YYYY/MM/DD') ذخیره می‌شود. */
export function DateField({ label, hint, ...rest }: { label: string; hint?: string } & DatePickerProps) {
  return (
    <>
      <FieldLabel>{label}</FieldLabel>
      <DatePicker {...jalaliDatePickerProps} {...rest} />
      {hint && <FieldHint>{hint}</FieldHint>}
    </>
  );
}
