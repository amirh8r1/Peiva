import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge, Empty, Space, Tabs, theme } from 'antd';
import { useData } from '@/context/DataContext';
import { PageFrame } from '@/components/ui/PageFrame';
import { PageHeader } from '@/components/ui/PageHeader';
import { CardGrid } from '@/components/ui/CardGrid';
import { RequestSummaryCard } from '@/features/requests/components/RequestSummaryCard';
import { REQUEST_STATUS_LABELS } from '@/types/request';
import type { SupplierRequestStatus } from '@/types/request';
import { formatNumber } from '@/utils/format';

type TabKey = SupplierRequestStatus | 'all';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'all', label: 'همه' },
  { key: 'pending', label: REQUEST_STATUS_LABELS.pending },
  { key: 'matched', label: REQUEST_STATUS_LABELS.matched },
  { key: 'in_progress', label: REQUEST_STATUS_LABELS.in_progress },
  { key: 'completed', label: REQUEST_STATUS_LABELS.completed },
  { key: 'rejected', label: REQUEST_STATUS_LABELS.rejected },
];

/** صندوق درخواست‌های مشارکت‌کنندگان — نقطه شروع تطبیق مزرعه و برآورد سهم. */
export function RequestsInboxPage() {
  const navigate = useNavigate();
  const { token } = theme.useToken();
  const { data } = useData();
  const [tab, setTab] = useState<TabKey>('all');

  const countOf = (key: TabKey) =>
    key === 'all' ? data.requests.length : data.requests.filter((r) => r.status === key).length;

  const filtered = tab === 'all' ? data.requests : data.requests.filter((r) => r.status === tab);

  return (
    <PageFrame
      remountKey={tab}
      header={<PageHeader title="صندوق درخواست‌ها" subtitle="درخواست‌های مشارکت‌کنندگان — تطبیق مزرعه و برآورد سهم" />}
    >
      <Tabs
        activeKey={tab}
        onChange={(k) => setTab(k as TabKey)}
        items={TABS.map((t) => ({
          key: t.key,
          label: (
            <Space size={4}>
              {t.label}
              <Badge count={formatNumber(countOf(t.key))} size="small" style={{ backgroundColor: token.colorTextTertiary }} />
            </Space>
          ),
        }))}
      />
      <CardGrid minWidth={320} gap={12}>
        {filtered.map((r) => (
          <RequestSummaryCard key={r.id} request={r} onClick={() => navigate(`/admin/requests/${r.id}`)} />
        ))}
      </CardGrid>
      {filtered.length === 0 && <Empty description="درخواستی در این وضعیت ندارید" />}
    </PageFrame>
  );
}
