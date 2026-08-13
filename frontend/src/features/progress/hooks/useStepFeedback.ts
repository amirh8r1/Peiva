import { makeEvent, todayJalali } from '../utils/progress.utils';
import type { ContractProgressStep, ProgressRole } from '@/types';

/**
 * اکشن‌های مشترک پاسخ‌دهنده (تأیید/رد) — برای گام‌های supply/pickup/driver.
 * پیلود گام در confirm بدون تغییر می‌ماند مگر extraPayload داده شود
 * (مثلاً pickup وزن/تعداد و earliestPickup را هنگام تأیید ثبت می‌کند).
 */
export function useStepFeedback(
  step: ContractProgressStep,
  role: ProgressRole,
  onUpsert: (next: ContractProgressStep) => void,
) {
  const confirm = (extraPayload?: object) => {
    onUpsert({
      ...step,
      status: 'done',
      confirmedAt: todayJalali(),
      payload: extraPayload
        ? ({ ...step.payload, ...extraPayload } as typeof step.payload)
        : step.payload,
      events: [...step.events, makeEvent(role, 'confirmed')],
    } as typeof step);
  };

  const reject = (note: string) => {
    onUpsert({
      ...step,
      status: 'rejected',
      rejectedNote: note,
      events: [...step.events, makeEvent(role, 'rejected', note)],
    } as typeof step);
  };

  return { confirm, reject };
}
