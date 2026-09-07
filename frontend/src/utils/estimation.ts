/**
 * ریاضیات برآورد هزینه و سهم مشارکت‌کننده — مدل زنجیره‌دار v3.
 * Pure functions بدون React — قابل تست و قابل استفاده هم در UI و هم بعداً در API.
 *
 * اصل شفافیت: هر نهاده لازم تولید همیشه ردیف دارد؛ owner ردیف تعیین می‌کند
 * چه بخشی «ارزش نهاده مشارکت‌کننده» است (سهم = ارزش نهاده ÷ کل هزینه تولید).
 */
import type { Farm } from '@/types/farm';
import type { CostEstimation, EstimationRow, SupplierRequest } from '@/types/request';

/** قیمت‌ها و ضرایب پیش‌فرض بازار — هم‌سطح mockهای موجود (قابل ویرایش توسط زنجیره‌دار). */
export const ESTIMATION_CONSTANTS = {
  /** قیمت بازار مرغ زنده (تومان/کیلوگرم) */
  livePricePerKg: 90_000,
  /** قیمت دان (تومان/کیلوگرم) — هم‌سطح mockFeedSuppliers (11.5k–13k) */
  feedPricePerKg: 12_500,
  /** قیمت جوجه یکروزه (تومان/قطعه) — هم‌سطح mockChickSuppliers (16.5k–18.5k) */
  chickPricePerPiece: 17_500,
  /** کارمزد مزرعه‌دار (٪ از ارزش تولید) */
  farmFeePercent: 8,
  /** کارمزد زنجیره‌دار (٪ از ارزش تولید) */
  adminFeePercent: 5,
  /** هزینه لجستیک ثابت (تومان) — ردیف قابل ویرایش، پیش‌فرض ۰ */
  logisticsFlat: 0,
  /** درصد بقای دوره پرورش */
  survivalRate: 0.93,
  /** وزن پایانی هر مرغ (کیلوگرم) */
  defaultAvgWeightKg: 2.2,
  /** ضریب تبدیل پیش‌فرض وقتی مزرعه هنوز انتخاب نشده */
  defaultFcr: 1.8,
} as const;

/** کمیت ردیف‌های نهاده از درخواست. */
function inputAmount(request: SupplierRequest, kind: SupplierRequest['inputs'][number]['kind']): number {
  return request.inputs.find((i) => i.kind === kind)?.amount ?? 0;
}

/** تعداد قطعه لازم برای ظرفیت مزرعه — معیار پیشنهاد خودکار مزرعه. */
export function requiredBirds(request: SupplierRequest): number {
  const chicks = inputAmount(request, 'chick');
  if (chicks > 0) return Math.round(chicks);
  const { survivalRate, defaultAvgWeightKg } = ESTIMATION_CONSTANTS;
  return Math.ceil(request.desiredKg / (survivalRate * defaultAvgWeightKg));
}

/** تخمین تولید مرغ زنده (کیلوگرم) از نهاده‌های درخواست؛ FCR واقعی مزرعه وقتی انتخاب شده باشد. */
export function estimateProductionKg(request: SupplierRequest, farm?: Farm): number {
  const chicks = inputAmount(request, 'chick');
  const feedTons = inputAmount(request, 'feed');
  const { survivalRate, defaultAvgWeightKg, defaultFcr } = ESTIMATION_CONSTANTS;

  const chickKg = chicks > 0 ? chicks * survivalRate * defaultAvgWeightKg : 0;
  const feedKg = feedTons > 0 ? (feedTons * 1000) / (farm?.avgConversionRatio ?? defaultFcr) : 0;

  if (chickKg > 0 && feedKg > 0) return Math.round((chickKg + feedKg) / 2);
  if (chickKg > 0) return Math.round(chickKg);
  if (feedKg > 0) return Math.round(feedKg);
  // فقط نقدی → کل تولید باید از نهاده خریداری‌شده تأمین شود
  return request.desiredKg;
}

/**
 * ردیف‌های پیش‌فرض برآورد — هر نهاده لازم تولید همیشه ردیف دارد:
 * ردیف نهاده‌ای که مشارکت‌کننده داده owner='supplier' است (مبنای سهم)؛
 * نهاده‌ای که نداده را زنجیره‌دار می‌خرد → owner='admin'.
 */
export function buildDefaultRows(request: SupplierRequest, farm?: Farm): EstimationRow[] {
  const c = ESTIMATION_CONSTANTS;
  const productionKg = estimateProductionKg(request, farm);
  const fcr = farm?.avgConversionRatio ?? c.defaultFcr;

  const providedFeed = inputAmount(request, 'feed');
  const providedChicks = inputAmount(request, 'chick');

  // دان موردنیاز تولید = productionKg × FCR (کیلوگرم)
  const neededFeedKg = productionKg * fcr;
  // جوجه موردنیاز تولید = productionKg ÷ (بقا × وزن پایانی)
  const neededChicks = productionKg / (c.survivalRate * c.defaultAvgWeightKg);

  const rows: EstimationRow[] = [
    {
      key: 'feed',
      label: providedFeed > 0 ? `دان تأمین‌شده توسط مشارکت‌کننده (${providedFeed} تن)` : 'خرید دان توسط زنجیره‌دار',
      kind: 'value',
      owner: providedFeed > 0 ? 'supplier' : 'admin',
      amount: Math.round(neededFeedKg * c.feedPricePerKg),
    },
    {
      key: 'chick',
      label: providedChicks > 0 ? `جوجه تأمین‌شده توسط مشارکت‌کننده (${formatCount(providedChicks)})` : 'خرید جوجه توسط زنجیره‌دار',
      kind: 'value',
      owner: providedChicks > 0 ? 'supplier' : 'admin',
      amount: Math.round(neededChicks * c.chickPricePerPiece),
    },
  ];

  const cash = inputAmount(request, 'cash');
  if (cash > 0) {
    rows.push({ key: 'cash', label: 'وجه نقد مشارکت‌کننده', kind: 'value', owner: 'supplier', amount: cash });
  }

  rows.push(
    { key: 'logistics', label: 'هزینه حمل و لجستیک', kind: 'value', owner: 'admin', amount: c.logisticsFlat },
    { key: 'farmFee', label: 'کارمزد مزرعه‌دار', kind: 'percent', owner: 'farm', amount: c.farmFeePercent },
    { key: 'adminFee', label: 'کارمزد زنجیره‌دار', kind: 'percent', owner: 'admin', amount: c.adminFeePercent },
  );
  return rows;
}

/** عدد با جداکننده هزارگان — فقط برای متن label (بدون وابستگی format). */
function formatCount(n: number): string {
  return n.toLocaleString('en-US');
}

export interface ShareComputation {
  /** ارزش کل تولید = productionKg × قیمت بازار */
  productionValue: number;
  /** ارزش نهاده‌های مشارکت‌کننده = Σ ردیف‌های supplier از نوع value */
  supplierInputCost: number;
  /** کل هزینه تولید = Σ همه ردیف‌ها (percent → مبلغ) */
  totalCost: number;
  /** سهم مشارکت‌کننده (٪) — ۰ وقتی totalCost صفر است */
  supplierSharePercent: number;
  /** سهم مشارکت‌کننده (کیلوگرم مرغ) */
  supplierShareKg: number;
}

/** محاسبه سهم از ردیف‌ها — با هر تغییر ردیف/تولید فراخوانی می‌شود (زنده). */
export function computeShares(rows: EstimationRow[], productionKg: number): ShareComputation {
  const productionValue = Math.round(productionKg * ESTIMATION_CONSTANTS.livePricePerKg);

  let supplierInputCost = 0;
  let totalCost = 0;
  for (const row of rows) {
    const amount = row.kind === 'percent' ? Math.round((row.amount / 100) * productionValue) : row.amount;
    totalCost += amount;
    if (row.owner === 'supplier' && row.kind === 'value') supplierInputCost += row.amount;
  }

  const supplierSharePercent = totalCost > 0 ? Math.round((supplierInputCost / totalCost) * 10000) / 100 : 0;
  return {
    productionValue,
    supplierInputCost,
    totalCost,
    supplierSharePercent,
    supplierShareKg: Math.round((productionKg * supplierSharePercent) / 100),
  };
}

/** ساخت CostEstimation کامل از درخواست (و مزرعه انتخاب‌شده در صورت وجود). */
export function buildEstimation(request: SupplierRequest, farm?: Farm): CostEstimation {
  const productionKg = estimateProductionKg(request, farm);
  const rows = buildDefaultRows(request, farm);
  const shares = computeShares(rows, productionKg);
  return { productionKg, rows, ...shares, version: 1 };
}

/** پیشنهاد خودکار مزرعه: فعال + هم‌استان + ظرفیت کافی؛ مرتب‌سازی گرید ← امتیاز ← ضریب تبدیل. */
export function suggestFarms(request: SupplierRequest, farms: Farm[], limit = 5): Farm[] {
  const need = requiredBirds(request);
  const gradeRank: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 };
  return farms
    .filter((f) => f.active && f.address.province === request.province && f.capacity >= need)
    .sort((a, b) =>
      (gradeRank[a.grade] - gradeRank[b.grade]) ||
      (b.rating - a.rating) ||
      (a.avgConversionRatio - b.avgConversionRatio))
    .slice(0, limit);
}
