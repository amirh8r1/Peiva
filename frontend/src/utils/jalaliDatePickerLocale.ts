import faIR from 'antd/locale/fa_IR';

const jalaliMonths = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند',
];

const jalaliShortMonths = [
  'فرو', 'ارد', 'خرد', 'تیر', 'مرد', 'شهر',
  'مهر', 'آبا', 'آذر', 'دی', 'بهم', 'اسف',
];

export const jalaliDatePickerLocale = {
  ...faIR.DatePicker,
  lang: {
    ...faIR.DatePicker?.lang,
    locale: 'fa_IR',
    months: jalaliMonths,
    shortMonths: jalaliShortMonths,
    monthFormat: 'MMMM',
    yearFormat: 'YYYY',
    dateFormat: 'YYYY/MM/DD',
    dateTimeFormat: 'YYYY/MM/DD HH:mm',
  },
} as any;
