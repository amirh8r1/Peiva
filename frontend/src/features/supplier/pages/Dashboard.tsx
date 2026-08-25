import { useNavigate } from 'react-router-dom';
import { Empty } from 'antd';
import { useData } from '@/context/DataContext';
import { PageFrame } from '@/components/ui/PageFrame';
import { PageHeader } from '@/components/ui/PageHeader';
import { CardGrid } from '@/components/ui/CardGrid';
import { CountStatTile } from '@/components/ui/CountStatTile';
import { NotificationSection, toNotifyItems, type NotifyItem } from '@/components/ui/NotificationSection';
import { formatNumber } from '@/utils/format';
import { getPendingActions, getWeightRequestActions } from '@/features/progress/utils/progress.utils';
import type { SupplierRequestStatus } from '@/types/request';

/** داشبورد تأمین‌کننده — وضعیت درخواست‌ها + اقدامات فلو اجرا (بدون تغییر) + نوتیف سهم. */
export function SupplierDashboard() {
  const navigate = useNavigate();
  const { data } = useData();
  const requests = data.requests;
  const contracts = data.contracts;

  const count = (status: SupplierRequestStatus) => requests.filter((r) => r.status === status).length;

  const stats = [
    { label: 'درخواست‌ها', value: requests.length, tone: 'neutral' as const, onClick: () => navigate('/supplier/requests') },
    { label: 'در انتظار بررسی', value: count('pending'), tone: 'warning' as const },
    { label: 'در حال اجرا', value: count('in_progress'), tone: 'info' as const },
    { label: 'قراردادهای جاری', value: contracts.filter((c) => c.status === 'finalized').length, tone: 'success' as const },
  ];

  const progress = getPendingActions(data, 'supplier');
  const weights = getWeightRequestActions(data, 'supplier');

  const actions: NotifyItem[] = [
    ...toNotifyItems(progress.filter((p) => p.kind === 'action'), (cid) => navigate(`/supplier/contracts/${cid}/progress`)),
    ...toNotifyItems(weights.filter((w) => w.kind === 'action'), (cid) => navigate(`/supplier/contracts/${cid}/progress?tab=weight`)),
  ];

  const infos: NotifyItem[] = [
    ...toNotifyItems(progress.filter((p) => p.kind === 'info'), (cid) => navigate(`/supplier/contracts/${cid}/progress`)),
    ...(requests.length > 0 ? [{
      id: 'my-requests',
      title: 'درخواست‌های من',
      body: `${formatNumber(requests.length)} درخواست ثبت‌شده — وضعیت و سهم شما از هر درخواست`,
      onClick: () => navigate('/supplier/requests'),
      buttonLabel: 'مشاهده درخواست‌ها',
    }] : []),
  ];

  return (
    <PageFrame header={<PageHeader title="داشبورد تأمین‌کننده" />}>
      <CardGrid minWidth={160} gap={12}>
        {stats.map((s) => <CountStatTile key={s.label} direction="column" {...s} />)}
      </CardGrid>
      <NotificationSection title="نیازمند اقدام شما" kind="action" items={actions} />
      <NotificationSection title="اطلاعیه‌ها" kind="info" items={infos} />
      {actions.length === 0 && infos.length === 0 && <Empty description="نوتیف جدیدی ندارید" />}
    </PageFrame>
  );
}
