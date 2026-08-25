import { Tag } from 'antd';
import { REQUEST_STATUS_LABELS } from '@/types/request';
import type { SupplierRequestStatus } from '@/types/request';

/** رنگ Tag از preset های antd (توکن‌محور). */
const STATUS_COLORS: Record<SupplierRequestStatus, string> = {
  pending: 'processing',
  matched: 'blue',
  in_progress: 'warning',
  completed: 'success',
  rejected: 'error',
};

export function RequestStatusTag({ status }: { status: SupplierRequestStatus }) {
  return <Tag color={STATUS_COLORS[status]} style={{ margin: 0 }}>{REQUEST_STATUS_LABELS[status]}</Tag>;
}
