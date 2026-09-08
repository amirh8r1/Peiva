/**
 * سند پیش‌قرارداد (HTML چاپ‌پذیر) — دانلود به‌صورت فایل با Blob
 * (امن در برابر popup-blocker) و قابل چاپ مستقیم از مرورگر.
 * شامل تعهدات طرفین، پارامترهای تولید و برآورد سهم با تلرانس ±۱۰٪.
 */
import { ESTIMATION_CONSTANTS } from '@/utils/estimation';
import type { RequestInput } from '@/types/request';
import type { ParticipationComputation } from '@/utils/participation';
import { formatNumber, toPersianDigits } from '@/utils/format';

interface ContractDocOptions {
  inputs: RequestInput[];
  /** تولید کل برآوردی (کیلوگرم) */
  productionKg: number;
  /** وزن مطلوب هر مرغ زنده (کیلوگرم) */
  perBirdKg: number;
  feedDeliveryDate: string;
  province: string;
  participation: ParticipationComputation;
  /** شماره درخواست (بدون پیشوند) — برای شناسه سند */
  requestId: string;
  createdAt: string;
}

const INPUT_TITLES: Record<RequestInput['kind'], string> = {
  feed: 'نهاده (دان مرغی)',
  chick: 'جوجه یک‌روزه',
  cash: 'سرمایه در گردش',
};

/** تعهدات مشارکت‌کننده — از آورده‌های انتخاب‌شده + ترکیب استاندارد نهاده. */
function buildParticipantRows(o: ContractDocOptions): string {
  const c = ESTIMATION_CONSTANTS;
  const feed = o.inputs.find((i) => i.kind === 'feed');
  const chick = o.inputs.find((i) => i.kind === 'chick');
  const cash = o.inputs.find((i) => i.kind === 'cash');

  const rows: string[] = [];
  if (feed) {
    rows.push(`<tr><td>تحویل نهاده</td><td class="num">${formatNumber(feed.amount)} تن — ترکیب ٪${formatNumber(c.feedCornPercent)} ذرت و ٪${formatNumber(c.feedSoybeanPercent)} کنجاله سویا</td></tr>`);
    rows.push(`<tr><td>تاریخ تحویل نهاده</td><td class="num">${toPersianDigits(o.feedDeliveryDate)}</td></tr>`);
  }
  if (chick) rows.push(`<tr><td>تحویل جوجه یک‌روزه</td><td class="num">تأمین کامل — ${formatNumber(chick.amount)} قطعه</td></tr>`);
  if (cash) rows.push(`<tr><td>سرمایه در گردش</td><td class="num">تأمین کامل سایر هزینه‌های دوره</td></tr>`);
  return rows.join('');
}

/** HTML کامل سند — RTL، برند پیوا، تعهدات طرفین و برآورد سهم. رنگ‌های برند داخل سند ثابت‌اند (فایل آفلاین). */
export function buildContractHtml(o: ContractDocOptions): string {
  const bucketRows = o.participation.buckets
    .map((b) => `<tr><td>${b.label}</td><td>٪${formatNumber(b.percent)}</td><td>${formatNumber(Math.round((b.percent / 100) * o.participation.estimatedBirds))} قطعه</td></tr>`)
    .join('');

  const chickInput = o.inputs.find((i) => i.kind === 'chick');

  return `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
<meta charset="UTF-8">
<title>پیش‌قرارداد مشارکت — پیوا</title>
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
  .tolerance { background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 10px 12px; font-size: 12px; color: #92400e; margin-top: 12px; }
  .foot { margin-top: 28px; padding-top: 12px; border-top: 1px solid #e7e5e4; color: #78716c; font-size: 11px; text-align: center; }
  @media print { body { background: #fff; } .page { padding: 16px; } }
</style>
</head>
<body>
<div class="page">
  <div class="brand">
    <h1>پیوا</h1>
    <p>مزرعه‌ای به وسعت ایران — پیش‌قرارداد مشارکت در تولید</p>
    <p class="meta">شماره سند: ${o.requestId} · تاریخ ثبت: ${toPersianDigits(o.createdAt)}</p>
  </div>

  <h2>طرفین</h2>
  <table>
    <tr><td>مشارکت‌کننده</td><td>شما</td></tr>
    <tr><td>زنجیره‌دار</td><td>پیوا (تأیید نهایی پس از بررسی)</td></tr>
    <tr><td>مزرعه‌دار</td><td>تطبیق توسط زنجیره‌دار</td></tr>
  </table>

  <h2>تعهدات مشارکت‌کننده</h2>
  <table>${buildParticipantRows(o)}</table>

  <h2>تعهدات زنجیره‌دار (پیوا)</h2>
  <table>
    ${chickInput ? '' : `<tr><td>تأمین جوجه یک‌روزه</td><td class="num">${formatNumber(o.participation.requiredBirds)} قطعه</td></tr>`}
    <tr><td>مزرعه و ناظر فنی</td><td>تطبیق مزرعه استان و نظارت فنی دوره</td></tr>
    <tr><td>دارو، واکسن و انرژی</td><td>تأمین کامل ملزومات پرورش</td></tr>
    <tr><td>تسویه سهم</td><td>تسویه سهم مشارکت‌کننده طبق این سند</td></tr>
  </table>

  <h2>پارامترهای تولید</h2>
  <table>
    <tr><td>وزن مطلوب هر مرغ زنده</td><td class="num">${formatNumber(o.perBirdKg)} کیلوگرم</td></tr>
    <tr><td>استان تولید</td><td class="num">${o.province}</td></tr>
    <tr><td>تولید کل برآوردی</td><td class="num">${formatNumber(o.productionKg)} کیلوگرم مرغ زنده</td></tr>
    <tr><td>جوجه لازم</td><td class="num">${formatNumber(o.participation.requiredBirds)} قطعه</td></tr>
  </table>

  <h2>برآورد و سهم بازیگران</h2>
  <p class="meta">تعداد مرغ نهایی حدودی: <span class="big">${formatNumber(o.participation.estimatedBirds)}</span> قطعه (حدود ${formatNumber(o.productionKg)} کیلوگرم مرغ زنده)</p>
  <table>
    ${bucketRows}
    <tr><td><strong>سهم مشارکت‌کننده از مرغ تولیدی</strong></td><td><strong>٪${formatNumber(o.participation.shares.participant)}</strong></td><td><strong>${formatNumber(Math.round(o.participation.shares.participant * o.participation.estimatedBirds / 100))} قطعه</strong></td></tr>
  </table>
  <div class="tolerance">تلرانس ٪${formatNumber(o.participation.tolerancePercent)}± — به دلیل سقف تلفات مجاز و تراکم‌ریزی مجاز، تعداد مرغ نهایی ممکن است بین ${formatNumber(o.participation.minBirds)} تا ${formatNumber(o.participation.maxBirds)} قطعه باشد؛ سهم هر طرف به همان نسبت تنظیم می‌شود.</div>

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
  a.download = `پیش‌قرارداد-مشارکت-پیوا-${o.requestId}.html`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
