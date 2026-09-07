/**
 * منبع واحد نوتیفیکیشن‌های زنگوله پنل مشارکت‌کننده — همه از data موجود مشتق می‌شوند
 * (بدون مدل جدید) و بر اساس موضوعیت گروه‌بندی می‌شوند.
 */
import { getPendingActions, getWeightRequestActions, daysUntil } from '@/features/progress/utils/progress.utils';
import { formatNumber, toPersianDigits } from '@/utils/format';
import type { AppData } from '@/context/DataContext';
import type { ContractProgressStep } from '@/types';

export type CenterGroupKey = 'contracts' | 'actions' | 'delivery' | 'reminders';

export interface CenterItem {
  id: string;
  group: CenterGroupKey;
  title: string;
  body: string;
  /** action = نیازمند توجه (در بج شمرده می‌شود)؛ info = اطلاع‌رسانی */
  kind: 'action' | 'info';
  /** مسیر ناوبری با کلیک */
  to: string;
}

export const CENTER_GROUPS: { key: CenterGroupKey; label: string }[] = [
  { key: 'contracts', label: 'قراردادها' },
  { key: 'actions', label: 'اقدام‌های لازم' },
  { key: 'delivery', label: 'تحویل' },
  { key: 'reminders', label: 'یادآوری‌ها' },
];

/** یادآور زمانی برداشت — pickup ثبت/تأیید شده و تحویل هنوز باز است. */
function pickupReminders(data: AppData): CenterItem[] {
  return data.contracts
    .filter((c) => c.status === 'finalized')
    .flatMap((c) => {
      const steps = data.progressSteps.filter((s) => s.contractId === c.id);
      const deliveryDone = steps.some((s) => s.key === 'delivery' && s.status === 'done');
      const pickup = steps.find(
        (s): s is Extract<ContractProgressStep, { key: 'pickup' }> =>
          s.key === 'pickup' && (s.status === 'claimed' || s.status === 'done') && !!s.payload.pickupDate,
      );
      if (!pickup || deliveryDone) return [];

      const d = daysUntil(pickup.payload.pickupDate);
      if (d < 0 || d > 7) return [];

      return [{
        id: `pickup-reminder-${c.id}`,
        group: 'delivery' as const,
        title: d <= 1 ? 'بارگیری نزدیک است' : 'برنامه برداشت نزدیک است',
        body: `${c.name} — ${d === 0 ? 'امروز' : `${toPersianDigits(d)} روز دیگر`} (${toPersianDigits(pickup.payload.pickupDate)})`,
        kind: 'action' as const,
        to: `/supplier/contracts/${c.id}/progress`,
      }];
    });
}

/** همه نوتیفیکیشن‌های پنل مشارکت‌کننده — گروه‌بندی‌شده و dedupe. */
export function getParticipantNotifications(data: AppData): CenterItem[] {
  const items: CenterItem[] = [];

  // ── قراردادها: وضعیت درخواست‌های من ──
  for (const r of data.requests) {
    if (r.status === 'pending') {
      items.push({
        id: `req-pending-${r.id}`,
        group: 'contracts',
        title: 'قرارداد شما در حال بررسی است',
        body: `${formatNumber(r.desiredKg)} کیلوگرم مرغ — ${r.province}`,
        kind: 'info',
        to: `/supplier/requests/${r.id}`,
      });
    }
    if (r.status === 'matched') {
      items.push({
        id: `req-matched-${r.id}`,
        group: 'contracts',
        title: 'درخواست شما تطبیق شده',
        body: 'در انتظار تأیید هماهنگی مزرعه — به‌زودی قرارداد نهایی می‌شود',
        kind: 'info',
        to: `/supplier/requests/${r.id}`,
      });
    }
  }

  // ── اقدام‌های لازم ──
  for (const a of getPendingActions(data, 'supplier')) {
    if (a.kind === 'action') {
      items.push({
        id: a.id,
        group: 'actions',
        title: a.contractName,
        body: `${a.stepLabel} — ${a.verb}`,
        kind: 'action',
        to: `/supplier/contracts/${a.contractId}/progress`,
      });
    }
  }

  // ── تحویل: پاسخ وزن دیده‌نشده + یادآور برداشت ──
  for (const w of getWeightRequestActions(data, 'supplier')) {
    items.push({
      id: w.id,
      group: 'delivery',
      title: w.title,
      body: `${w.contractName} — ${w.verb}`,
      kind: w.kind,
      to: `/supplier/contracts/${w.contractId}/progress?tab=weight`,
    });
  }
  items.push(...pickupReminders(data));

  // ── یادآوری‌ها: اطلاع‌رسانی‌های فلو ──
  for (const a of getPendingActions(data, 'supplier')) {
    if (a.kind === 'info') {
      items.push({
        id: a.id,
        group: 'reminders',
        title: a.contractName,
        body: `${a.stepLabel} — ${a.verb}`,
        kind: 'info',
        to: `/supplier/contracts/${a.contractId}/progress`,
      });
    }
  }

  return items;
}
