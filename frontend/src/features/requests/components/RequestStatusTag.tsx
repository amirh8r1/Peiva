import { REQUEST_STATUS_LABELS } from '@/types/request';
import type { SupplierRequestStatus } from '@/types/request';
import { StatusTag, type StatusTone } from '@/components/ui/StatusTag';

/** تن semantic هر وضعیت — pending خنثی است (در انتظار بررسی) تا «رنگین‌کمانی» نشود. */
const STATUS_TONES: Record<SupplierRequestStatus, StatusTone> = {
  pending: 'neutral',
  matched: 'info',
  in_progress: 'warning',
  completed: 'success',
  rejected: 'error',
};

export function RequestStatusTag({ status }: { status: SupplierRequestStatus }) {
  return <StatusTag tone={STATUS_TONES[status]}>{REQUEST_STATUS_LABELS[status]}</StatusTag>;
}
