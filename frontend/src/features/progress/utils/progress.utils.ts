import dayjs from '@/utils/dayjs';
import { toEnglishDigits } from '@/utils/format';
import {
  getProgressStepIndex, STEP_ROLES, PROGRESS_STEPS,
  type ContractProgressStep, type ProgressEvent, type ProgressRole, type ProgressStepKey, type UploadedDoc, type WeightRequest,
} from '@/types';
import type { AppData } from '@/context/DataContext';

// ── تاریخ جلالی ──
// قانون: هرگز رشته فارسی parse نشود؛ اول toEnglishDigits بعد parse jalali؛
// خروجی همیشه 'YYYY/MM/DD' انگلیسی (قابل مقایسه رشته‌ای).

/** امروز به فرمت 'YYYY/MM/DD' انگلیسی. */
export function todayJalali(): string {
  return dayjs().format('YYYY/MM/DD');
}

/** timestamp نمایشی fa-IR (کانونشن اپ — فقط نمایش، هرگز parse نشود). */
export function nowFa(): string {
  return new Date().toLocaleDateString('fa-IR');
}

/** افزودن روز به تاریخ 'YYYY/MM/DD' (ورودی می‌تواند فارسی یا انگلیسی باشد). */
export function addDaysJalali(dateStr: string, days: number): string {
  return (dayjs as any)(toEnglishDigits(dateStr), { jalali: true })
    .add(days, 'day')
    .format('YYYY/MM/DD');
}

/** آیا a قبل از b است؟ (مقایسه رشته‌ای — هر دو باید 'YYYY/MM/DD' انگلیسی باشند). */
export function isBeforeJalali(a: string, b: string): boolean {
  return toEnglishDigits(a) < toEnglishDigits(b);
}

/** تعداد روزهای باقی‌مانده تا dateStr (منفی = گذشته است). */
export function daysUntil(dateStr: string): number {
  return (dayjs as any)(toEnglishDigits(dateStr), { jalali: true }).diff(dayjs(), 'day');
}

// ── گام‌ها ──

export function getStepsForContract(all: ContractProgressStep[], contractId: string): ContractProgressStep[] {
  return all
    .filter((s) => s.contractId === contractId)
    .sort((a, b) => getProgressStepIndex(a.key) - getProgressStepIndex(b.key));
}

/** ایندکس اولین گام ناتمام (برای Steps antd). */
export function getActiveStepIndex(steps: ContractProgressStep[]): number {
  const idx = steps.findIndex((s) => s.status !== 'done');
  return idx === -1 ? steps.length - 1 : idx;
}

/** گیتینگ ترتیبی: گام فقط وقتی قابل ادعاست که همه گام‌های قبلی done باشند. */
export function isStepClaimable(steps: ContractProgressStep[], key: ProgressStepKey): boolean {
  const idx = getProgressStepIndex(key);
  return PROGRESS_STEPS.slice(0, idx).every(({ key: k }) => steps.some((s) => s.key === k && s.status === 'done'));
}

/** آیا نقش جاری روی گام می‌تواند اقدامی انجام دهد؟ زنجیره‌دار فقط نظارت می‌کند. */
export function canActOn(steps: ContractProgressStep[], key: ProgressStepKey, role: ProgressRole): boolean {
  if (role === 'admin') return false;
  const step = steps.find((s) => s.key === key);
  if (!step) return false;
  const { claimer, responder } = STEP_ROLES[key];

  if (key === 'driver') {
    if (role !== 'supplier') return false; // مزرعه‌دار فقط نوتیف می‌گیرد
    if (step.status === 'idle') return true; // اعلام (گیتینگ ترتیبی با صفحه)
    if (step.status === 'done') {
      // ویرایش تا قبل از تکمیل گام تحویل مجاز است
      const delivery = steps.find((s) => s.key === 'delivery');
      return !delivery || delivery.status !== 'done';
    }
    return false;
  }
  if (key === 'delivery') {
    const delivery = step as Extract<ContractProgressStep, { key: 'delivery' }>;
    if (!isStepClaimable(steps, key) || delivery.status === 'done') return false;
    if (role === 'farm') return delivery.status === 'idle' || delivery.status === 'rejected';
    return delivery.status === 'claimed' && !delivery.payload.supplierConfirmed;
  }
  if (role === claimer) return step.status === 'idle' || step.status === 'rejected';
  if (role === responder) return step.status === 'claimed';
  return false;
}

// ── آیتم‌های پیگیری داشبورد ──

export interface PendingAction {
  id: string;
  contractId: string;
  contractName: string;
  stepKey: ProgressStepKey;
  stepLabel: string;
  /** فعل قابل انجام: «ثبت ادعا» / «اصلاح و ارسال مجدد» / «تأیید» / «مشاهده» / «ویرایش مشخصات» */
  verb: string;
  /** action = نیازمند اقدام کاربر؛ info = اطلاع‌رسانی صرف (نوتیف راننده/ویرایش). */
  kind: 'action' | 'info';
}

const VERB: Record<ProgressStepKey, { claim: string; fix: string; respond: string; edit?: string }> = {
  supply: { claim: 'ثبت ادعای تحویل نهاده', fix: 'اصلاح و ارسال مجدد', respond: 'تأیید دریافت نهاده و جوجه' },
  pickup: { claim: 'ثبت درخواست برداشت', fix: 'اصلاح و ارسال مجدد', respond: 'تأیید درخواست برداشت' },
  driver: { claim: 'اعلام مشخصات دریافت‌کننده', fix: 'اصلاح و ارسال مجدد', respond: 'مشاهده', edit: 'ویرایش مشخصات دریافت‌کننده' },
  delivery: { claim: 'ثبت مشخصات تحویل و اسناد', fix: 'اصلاح و ارسال مجدد', respond: 'تأیید نهایی تحویل' },
};

/** آیتم‌های قابل اقدام نقش در داشبورد — از گام‌های قراردادهای نهایی مشتق می‌شود. */
export function getPendingActions(data: AppData, role: ProgressRole): PendingAction[] {
  const finalizedIds = new Set(data.contracts.filter((c) => c.status === 'finalized').map((c) => c.id));
  const nameOf = (id: string) => data.contracts.find((c) => c.id === id)?.name ?? '';

  const actions: PendingAction[] = [];
  for (const contractId of finalizedIds) {
    const steps = getStepsForContract(data.progressSteps, contractId);
    for (const step of steps) {
      let verb: string | null = null;
      let kind: PendingAction['kind'] = 'action';
      if (step.key === 'driver') {
        const delivery = steps.find((s) => s.key === 'delivery');
        const deliveryOpen = !delivery || delivery.status !== 'done';
        if (role === 'supplier') {
          if (step.status === 'idle' && isStepClaimable(steps, step.key)) verb = VERB[step.key].claim;
          else if (step.status === 'done' && deliveryOpen) { verb = VERB[step.key].edit ?? null; kind = 'info'; }
        } else if (role === 'farm' && step.status === 'done' && deliveryOpen) {
          verb = VERB[step.key].respond; // «مشاهده» — نوتیف مزرعه‌دار
          kind = 'info';
        }
      } else if (step.key === 'delivery') {
        if (isStepClaimable(steps, step.key) && step.status !== 'done') {
          if (role === 'farm') verb = step.status === 'rejected' ? VERB[step.key].fix : VERB[step.key].claim;
          else if (role === 'supplier' && step.status === 'claimed' && !step.payload.supplierConfirmed) verb = VERB[step.key].respond;
        }
      } else {
        const { claimer, responder } = STEP_ROLES[step.key];
        // گیتینگ ترتیبی: فقط اولین گام ناتمام کارت «ادعا/اصلاح» می‌گیرد
        if (role === claimer && (step.status === 'idle' || step.status === 'rejected') && isStepClaimable(steps, step.key)) {
          verb = step.status === 'rejected' ? VERB[step.key].fix : VERB[step.key].claim;
        } else if (role === responder && step.status === 'claimed') {
          verb = VERB[step.key].respond;
        }
      }
      if (verb) {
        actions.push({
          id: `${step.id}-${role}`,
          contractId,
          contractName: nameOf(contractId),
          stepKey: step.key,
          stepLabel: PROGRESS_STEPS.find((s) => s.key === step.key)?.label ?? step.key,
          verb,
          kind,
        });
      }
    }
  }
  return actions;
}

// ── درخواست‌های اعلام وزن ──

/** ساخت WeightRequest جدید با id یکتا و تاریخ امروز. */
export function makeWeightRequest(contractId: string): WeightRequest {
  return {
    id: `wr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    contractId,
    requestedBy: 'supplier',
    requestedAt: todayJalali(),
    status: 'pending',
  };
}

export interface WeightFollowup {
  id: string;
  contractId: string;
  contractName: string;
  title: string;
  verb: string;
  /** action = نیازمند اقدام/توجه کاربر؛ info = اطلاع‌رسانی صرف. */
  kind: 'action' | 'info';
}

/** کارت‌های داشبورد برای درخواست‌های وزن:
 *  farm → هر درخواست pending («پاسخ به درخواست وزن»)؛
 *  supplier → وقتی آخرین درخواست answered و هنوز دیده نشده و delivery باز است: «مشاهده»
 *  (با باز کردن تب اعلام وزن، خودکار دیده‌شده می‌شود و نوتیف از بین می‌رود). */
export function getWeightRequestActions(data: AppData, role: ProgressRole): WeightFollowup[] {
  if (role === 'admin') return []; // زنجیره‌دار فقط نظارت می‌کند — درخواست وزن بین تأمین‌کننده و مزرعه‌دار است
  const finalizedIds = new Set(data.contracts.filter((c) => c.status === 'finalized').map((c) => c.id));
  const nameOf = (id: string) => data.contracts.find((c) => c.id === id)?.name ?? '';

  const out: WeightFollowup[] = [];
  for (const contractId of finalizedIds) {
    const reqs = data.weightRequests.filter((r) => r.contractId === contractId); // append-only → آخرین = آخرین عنصر
    if (role === 'farm') {
      for (const r of reqs.filter((x) => x.status === 'pending')) {
        out.push({ id: `wf-${r.id}`, contractId, contractName: nameOf(contractId), title: 'درخواست اعلام وزن مرغ', verb: 'پاسخ به درخواست وزن', kind: 'action' });
      }
    } else {
      const latest = reqs[reqs.length - 1];
      if (latest?.status === 'answered' && !latest.seenAt) {
        const delivery = data.progressSteps.find((s) => s.key === 'delivery' && s.contractId === contractId);
        if (!delivery || delivery.status !== 'done') {
          out.push({ id: `wf-${latest.id}`, contractId, contractName: nameOf(contractId), title: 'پاسخ وزن مرغ اعلام شد', verb: 'مشاهده', kind: 'action' });
        }
      }
    }
  }
  return out;
}

// ── اسناد و رویدادها ──

/** تبدیل File به متادیتای قابل ذخیره — نام sanitize می‌شود و خود File هرگز در state نمی‌رود. */
export function makeUploadedDoc(file: File, by: ProgressRole): UploadedDoc {
  const basename = file.name.split(/[/\\]/).pop() ?? file.name;
  const clean = basename.replace(/[ -]/g, '').trim().slice(0, 60);
  return {
    id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: clean || 'سند بدون نام',
    size: file.size,
    type: file.type || 'application/octet-stream',
    uploadedBy: by,
    uploadedAt: nowFa(),
  };
}

/** ساخت رویداد audit با id یکتا. */
export function makeEvent(
  by: ProgressRole,
  type: ProgressEvent['type'],
  note?: string,
): ProgressEvent {
  return {
    id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    at: nowFa(),
    by,
    type,
    note,
  };
}

// ── InputNumber / DatePicker مشترک — منتقل شد به @/utils/fieldProps ──
export { numberFieldProps, jalaliDatePickerProps } from '@/utils/fieldProps';
