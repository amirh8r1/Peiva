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

/** داشبورد مزرعه‌دار — تأیید هماهنگی زنجیره‌دار + اقدامات فلو اجرا (بدون تغییر). */
export function FarmDashboard() {
  const navigate = useNavigate();
  const { data } = useData();
  const contracts = data.contracts;

  const awaiting = contracts.filter((c) => c.status === 'awaiting_farm');
  const finalized = contracts.filter((c) => c.status === 'finalized');
  const completed = contracts.filter((c) => c.status === 'completed');

  const progress = getPendingActions(data, 'farm');
  const weights = getWeightRequestActions(data, 'farm');

  const actions: NotifyItem[] = [
    ...awaiting.map((c) => ({
      id: `coord-${c.id}`,
      title: 'هماهنگی مزرعه',
      body: `${c.name} — زنجیره‌دار مزرعه شما را انتخاب کرده است`,
      onClick: () => navigate('/farm/contracts'),
      buttonLabel: 'بررسی و تأیید هماهنگی',
    })),
    ...toNotifyItems(progress.filter((p) => p.kind === 'action'), (cid) => navigate(`/farm/contracts/${cid}/progress`)),
    ...toNotifyItems(weights.filter((w) => w.kind === 'action'), (cid) => navigate(`/farm/contracts/${cid}/progress?tab=weight`)),
  ];

  const infos: NotifyItem[] = [
    ...toNotifyItems(progress.filter((p) => p.kind === 'info'), (cid) => navigate(`/farm/contracts/${cid}/progress`)),
    ...(finalized.length > 0 ? [{
      id: 'active-count',
      title: 'قراردادهای در جریان',
      body: `${formatNumber(finalized.length)} قرارداد`,
      onClick: () => navigate('/farm/contracts'),
      buttonLabel: 'مشاهده قراردادها',
    }] : []),
  ];

  const stats = [
    { label: 'در انتظار هماهنگی', value: awaiting.length, tone: 'warning' as const },
    { label: 'در جریان', value: finalized.length, tone: 'info' as const },
    { label: 'تکمیل‌شده', value: completed.length, tone: 'success' as const },
  ];

  return (
    <PageFrame header={<PageHeader title="داشبورد مزرعه‌دار" />}>
      <CardGrid minWidth={220} gap={12}>
        {stats.map((s) => <CountStatTile key={s.label} direction="column" {...s} />)}
      </CardGrid>
      <NotificationSection title="نیازمند اقدام شما" kind="action" items={actions} />
      <NotificationSection title="اطلاعیه‌ها" kind="info" items={infos} />
      {actions.length === 0 && infos.length === 0 && <Empty description="نوتیف جدیدی ندارید" />}
    </PageFrame>
  );
}
