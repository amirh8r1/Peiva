import { Stepper, type StepperItem } from '@/components/ui/Stepper';
import { PROGRESS_STEPS } from '@/types';
import type { ContractProgressStep, ProgressStepStatus } from '@/types';

const STATUS_MAP: Record<ProgressStepStatus, StepperItem['status']> = {
  idle: 'idle',
  claimed: 'current',
  rejected: 'error',
  done: 'done',
};

/** پراگرس ۴ مرحله‌ای — status هر آیتم از وضعیت گام خودش می‌آید. */
export function ProgressStepper({ steps }: { steps: ContractProgressStep[] }) {
  const items: StepperItem[] = PROGRESS_STEPS.map(({ key, label }) => ({
    label,
    status: STATUS_MAP[steps.find((s) => s.key === key)?.status ?? 'idle'],
  }));

  return <Stepper items={items} />;
}
