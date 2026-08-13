import { Steps } from 'antd';
import { PROGRESS_STEPS } from '@/types';
import type { ContractProgressStep, ProgressStepStatus } from '@/types';
import { getActiveStepIndex } from '../utils/progress.utils';

const STATUS_MAP: Record<ProgressStepStatus, 'wait' | 'process' | 'error' | 'finish'> = {
  idle: 'wait',
  claimed: 'process',
  rejected: 'error',
  done: 'finish',
};

/** پراگرس ۴ مرحله‌ای — status هر آیتم از وضعیت گام خودش می‌آید. */
export function ProgressStepper({ steps }: { steps: ContractProgressStep[] }) {
  const current = getActiveStepIndex(steps);
  const items = PROGRESS_STEPS.map(({ key, label }) => {
    const step = steps.find((s) => s.key === key);
    return {
      title: label,
      status: STATUS_MAP[step?.status ?? 'idle'],
    };
  });

  return (
    <Steps
      current={current}
      size="small"
      items={items}
    />
  );
}
