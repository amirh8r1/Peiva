/**
 * منطق مشارکت خودکار (ویزارد سفارش جدید) — منبع واحد محاسبه سهم بازیگران.
 * مدل additive و شفاف: سهم مشارکت‌کننده از آورده‌هایش می‌آید، سطل‌های پوشش‌نشده
 * به‌عنوان هزینه نمایش داده می‌شوند — جمع همیشه ۱۰۰٪ است.
 * تولید از نهاده (تن × ۱۰۰۰ ÷ ضریب تبدیل) محاسبه می‌شود؛ جوجه لازم و تعداد مرغ نهایی
 * از وزن مطلوب هر مرغ و نرخ بقا می‌آیند و تلرانس ±۱۰٪ (سقف تلفات و تراکم‌ریزی) هم همین‌جاست.
 * ثابت‌ها فقط از ESTIMATION_CONSTANTS می‌آیند (بدون magic number جدید).
 */
import { ESTIMATION_CONSTANTS } from '@/utils/estimation';
import type { ParticipationBucket, ParticipationShares, ParticipationSnapshot, RequestInput, RequestInputKind } from '@/types/request';

/** درصد سهم مشارکت‌کننده بابت هر نوع آورده (prototype — قابل تنظیم بعداً).
 *  مشارکت یعنی ۱۰۰٪ آن آورده — تیک = سهم کامل. */
export const SHARE_BY_KIND: Record<RequestInputKind, number> = {
  feed: 60, // نهاده
  chick: 20, // جوجه یک‌روزه
  cash: 8, // سرمایه در گردش (پوشش سایر هزینه‌ها)
};

/** سهم ثابت بازیگران دیگر */
const FARM_SHARE = 10;
const PLATFORM_SHARE = 2;

/** تلرانس تولید نهایی (٪±) — سقف تلفات مجاز و تراکم‌ریزی مجاز. */
const TOLERANCE_PERCENT = 10;

export interface ParticipationOptions {
  /** وزن مطلوب هر مرغ زنده (کیلوگرم) — پیش‌فرض وزن متوسط استاندارد */
  perBirdWeightKg?: number;
  /** تلرانس تولید (٪±) — پیش‌فرض TOLERANCE_PERCENT */
  tolerancePercent?: number;
}

export interface ParticipationComputation {
  /** کل تولید برآوردی مرغ زنده (کیلوگرم) */
  productionKg: number;
  /** ارزش تولید (تومان) */
  productionValue: number;
  /** جوجه لازم برای جوجه‌ریزی = تولید ÷ (بقا × وزن هر مرغ) */
  requiredBirds: number;
  /** تعداد حدودی مرغ نهایی = تولید ÷ وزن هر مرغ (پس از نرخ بقا) */
  estimatedBirds: number;
  /** کف و سقف تلرانس تعداد مرغ نهایی */
  minBirds: number;
  maxBirds: number;
  tolerancePercent: number;
  perBirdWeightKg: number;
  shares: ParticipationShares;
  buckets: ParticipationBucket[];
}

/** برآورد کامل از آورده‌ها و تولید محاسبه‌شده — برای پیش‌فاکتور و پیش‌قرارداد ویزارد. */
export function computeParticipation(
  inputs: RequestInput[],
  productionKg: number,
  opts: ParticipationOptions = {},
): ParticipationComputation {
  const { livePricePerKg, survivalRate, defaultAvgWeightKg } = ESTIMATION_CONSTANTS;
  const perBirdWeightKg = opts.perBirdWeightKg ?? defaultAvgWeightKg;
  const tolerancePercent = opts.tolerancePercent ?? TOLERANCE_PERCENT;

  const productionValue = Math.round(productionKg * livePricePerKg);
  const requiredBirds = Math.ceil(productionKg / (survivalRate * perBirdWeightKg));
  const estimatedBirds = Math.round(productionKg / perBirdWeightKg);
  const minBirds = Math.round(estimatedBirds * (1 - tolerancePercent / 100));
  const maxBirds = Math.round(estimatedBirds * (1 + tolerancePercent / 100));

  const provided = (kind: RequestInputKind) => inputs.some((i) => i.kind === kind && i.amount > 0) ? 1 : 0;
  const participant = SHARE_BY_KIND.feed * provided('feed')
    + SHARE_BY_KIND.chick * provided('chick')
    + SHARE_BY_KIND.cash * provided('cash');

  const shares: ParticipationShares = { participant, farm: FARM_SHARE, platform: PLATFORM_SHARE };

  // سطل‌های هزینه پوشش‌نشده — فقط اگر مشارکت‌کننده آن را نیاورده باشد
  const costBuckets: ParticipationBucket[] = (['feed', 'chick', 'cash'] as const)
    .map((kind) => ({
      key: kind,
      label: kind === 'feed' ? 'هزینه نهاده' : kind === 'chick' ? 'هزینه جوجه یک‌روزه' : 'سایر هزینه‌ها',
      percent: SHARE_BY_KIND[kind] * (1 - provided(kind)),
      amountToman: 0,
    }))
    .filter((b) => b.percent > 0);

  const buckets: ParticipationBucket[] = [
    ...(participant > 0 ? [{
      key: 'participant' as const,
      label: 'سهم مشارکت‌کننده',
      percent: participant,
      amountToman: 0,
    }] : []),
    ...costBuckets,
    { key: 'farm' as const, label: 'سهم مزرعه‌دار', percent: FARM_SHARE, amountToman: 0 },
    { key: 'platform' as const, label: 'سهم پلتفرم', percent: PLATFORM_SHARE, amountToman: 0 },
  ].map((b) => ({ ...b, amountToman: Math.round((b.percent / 100) * productionValue) }));

  return {
    productionKg,
    productionValue,
    requiredBirds,
    estimatedBirds,
    minBirds,
    maxBirds,
    tolerancePercent,
    perBirdWeightKg,
    shares,
    buckets,
  };
}

/** snapshot ذخیره‌شونده روی درخواست — برای نمایش بعداً در پنل مشارکت‌کننده و زنجیره‌دار. */
export function buildParticipationSnapshot(
  inputs: RequestInput[],
  productionKg: number,
  opts: ParticipationOptions = {},
): ParticipationSnapshot {
  const c = computeParticipation(inputs, productionKg, opts);
  return {
    estimatedBirds: c.estimatedBirds,
    requiredBirds: c.requiredBirds,
    minBirds: c.minBirds,
    maxBirds: c.maxBirds,
    tolerancePercent: c.tolerancePercent,
    perBirdWeightKg: c.perBirdWeightKg,
    productionKg: c.productionKg,
    productionValue: c.productionValue,
    shares: c.shares,
    buckets: c.buckets,
  };
}
