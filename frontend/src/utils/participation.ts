/**
 * منطق مشارکت خودکار (ویزارد قرارداد جدید) — منبع واحد محاسبه سهم بازیگران.
 * مدل additive و شفاف: سهم مشارکت‌کننده از آورده‌هایش می‌آید، سطل‌های پوشش‌نشده
 * به‌عنوان هزینه نمایش داده می‌شوند — جمع همیشه ۱۰۰٪ است.
 * ثابت‌ها فقط از ESTIMATION_CONSTANTS می‌آیند (بدون magic number جدید).
 */
import { ESTIMATION_CONSTANTS } from '@/utils/estimation';
import type { ParticipationBucket, ParticipationShares, ParticipationSnapshot, RequestInput, RequestInputKind } from '@/types/request';

/** درصد سهم مشارکت‌کننده بابت هر نوع آورده (prototype — قابل تنظیم بعداً) */
const SHARE_BY_KIND: Record<RequestInputKind, number> = {
  feed: 60, // نهاده
  chick: 20, // جوجه یک‌روزه
  cash: 8, // اعتبار مالی (پوشش سایر هزینه‌ها)
};

/** سهم ثابت بازیگران دیگر */
const FARM_SHARE = 10;
const PLATFORM_SHARE = 2;

/** تعداد حدودی مرغ زنده = وزن مطلوب ÷ (نرخ بقا × وزن متوسط مرغ زنده) */
export function estimatedBirds(desiredKg: number): number {
  const { survivalRate, defaultAvgWeightKg } = ESTIMATION_CONSTANTS;
  return Math.round(desiredKg / (survivalRate * defaultAvgWeightKg));
}

export interface ParticipationComputation {
  estimatedBirds: number;
  productionKg: number;
  productionValue: number;
  shares: ParticipationShares;
  buckets: ParticipationBucket[];
}

/** برآورد کامل از آورده‌ها و وزن مطلوب — برای گام ۳ و ۴ ویزارد. */
export function computeParticipation(inputs: RequestInput[], desiredKg: number): ParticipationComputation {
  const { livePricePerKg } = ESTIMATION_CONSTANTS;
  const productionKg = Math.round(desiredKg);
  const productionValue = Math.round(productionKg * livePricePerKg);

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
    estimatedBirds: estimatedBirds(desiredKg),
    productionKg,
    productionValue,
    shares,
    buckets,
  };
}

/** snapshot ذخیره‌شونده روی درخواست — برای نمایش بعداً در پنل مشارکت‌کننده و زنجیره‌دار. */
export function buildParticipationSnapshot(inputs: RequestInput[], desiredKg: number): ParticipationSnapshot {
  const c = computeParticipation(inputs, desiredKg);
  return {
    estimatedBirds: c.estimatedBirds,
    productionKg: c.productionKg,
    productionValue: c.productionValue,
    shares: c.shares,
    buckets: c.buckets,
  };
}
