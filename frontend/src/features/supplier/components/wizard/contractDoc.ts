/**
 * سند قرارداد پیشنهادی (HTML چاپ‌پذیر) — دانلود به‌صورت فایل با Blob
 * (امن در برابر popup-blocker) و قابل چاپ مستقیم از مرورگر.
 */
import { REQUEST_INPUT_LABELS } from '@/types/request';
import type { RequestInput } from '@/types/request';
import type { ParticipationComputation } from '@/utils/participation';
import { formatNumber, toPersianDigits } from '@/utils/format';

interface ContractDocOptions {
  inputs: RequestInput[];
  desiredKg: number;
  deliveryDate: string;
  province: string;
  participation: ParticipationComputation;
  /** شماره درخواست (بدون پیشوند) — برای شناسه سند */
  requestId: string;
  createdAt: string;
}

const INPUT_TITLES: Record<RequestInput['kind'], string> = {
  feed: 'نهاده (دان مرغی)',
  chick: 'جوجه یک‌روزه',
  cash: 'اعتبار مالی',
};

/** HTML کامل سند — RTL، برند پیوا، جدول آورده‌ها و برآورد سهم. رنگ‌های برند داخل سند ثابت‌اند (فایل آفلاین). */
export function buildContractHtml(o: ContractDocOptions): string {
  const rows = o.inputs
    .map((i) => `<tr><td>${INPUT_TITLES[i.kind]}</td><td>${formatNumber(i.amount)} ${REQUEST_INPUT_LABELS[i.kind].unit}</td></tr>`)
    .join('');

  const bucketRows = o.participation.buckets
    .map((b) => `<tr><td>${b.label}</td><td>٪${formatNumber(b.percent)}</td><td>${formatNumber(b.amountToman)} تومان</td></tr>`)
    .join('');

  return `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
<meta charset="UTF-8">
<title>قرارداد مشارکت — پیوا</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<style>
  body { font-family: Vazirmatn, Tahoma, sans-serif; color: #1c1917; margin: 0; background: #f7f5f1; }
  .page { max-width: 700px; margin: 0 auto; background: #fff; padding: 32px 40px; }
  .brand { border-bottom: 3px solid #14532d; padding-bottom: 12px; margin-bottom: 20px; }
  .brand h1 { margin: 0; color: #14532d; font-size: 26px; }
  .brand p { margin: 4px 0 0; color: #78716c; font-size: 13px; }
  h2 { color: #14532d; font-size: 16px; margin: 24px 0 8px; border-right: 4px solid #15803d; padding-right: 8px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  td { border-bottom: 1px solid #e7e5e4; padding: 8px 4px; }
  td:first-child { color: #57534e; width: 45%; }
  .num { text-align: left; }
  .big { font-size: 22px; font-weight: 800; color: #15803d; }
  .meta { color: #57534e; font-size: 12px; margin: 0; }
  .foot { margin-top: 28px; padding-top: 12px; border-top: 1px solid #e7e5e4; color: #78716c; font-size: 11px; text-align: center; }
  @media print { body { background: #fff; } .page { padding: 16px; } }
</style>
</head>
<body>
<div class="page">
  <div class="brand">
    <h1>پیوا</h1>
    <p>مزرعه‌ای به وسعت ایران — قرارداد مشارکت در پرورش مرغ</p>
    <p class="meta">شماره سند: ${o.requestId} · تاریخ ثبت: ${toPersianDigits(o.createdAt)}</p>
  </div>

  <h2>طرفین</h2>
  <table>
    <tr><td>مشارکت‌کننده</td><td>شما</td></tr>
    <tr><td>زنجیره‌دار</td><td>پیوا (تأیید نهایی پس از بررسی)</td></tr>
    <tr><td>مزرعه‌دار</td><td>تطبیق توسط زنجیره‌دار</td></tr>
  </table>

  <h2>آورده‌های مشارکت‌کننده</h2>
  <table>${rows}</table>

  <h2>پارامترهای درخواست</h2>
  <table>
    <tr><td>وزن مرغ مطلوب</td><td class="num">${formatNumber(o.desiredKg)} کیلوگرم مرغ زنده</td></tr>
    <tr><td>زمان تحویل حدودی</td><td class="num">${toPersianDigits(o.deliveryDate)}</td></tr>
    <tr><td>استان مدنظر</td><td class="num">${o.province}</td></tr>
  </table>

  <h2>برآورد و سهم بازیگران</h2>
  <p class="meta">تعداد حدودی مرغ زنده تحویلی: <span class="big">${formatNumber(o.participation.estimatedBirds)}</span> قطعه (حدود ${formatNumber(o.participation.productionKg)} کیلوگرم)</p>
  <table>
    ${bucketRows}
    <tr><td><strong>سهم مشارکت‌کننده از مرغ تولیدی</strong></td><td><strong>٪${formatNumber(o.participation.shares.participant)}</strong></td><td><strong>${formatNumber(o.participation.shares.participant * o.participation.productionKg / 100)} کیلوگرم مرغ</strong></td></tr>
  </table>

  <p class="foot">این سند پیشنهادی است و ثبت نهایی آن پس از بررسی و تأیید زنجیره‌دار انجام می‌شود.</p>
</div>
</body>
</html>`;
}

/** دانلود سند به‌صورت فایل HTML (بدون پنجره جدید). */
export function downloadContractDoc(o: ContractDocOptions): void {
  const html = buildContractHtml(o);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `قرارداد-مشارکت-پیوا-${o.requestId}.html`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
