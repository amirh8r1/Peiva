import { useNavigate } from 'react-router-dom';
import { Empty } from 'antd';
import { useData } from '@/context/DataContext';
import { PageFrame } from '@/components/ui/PageFrame';
import { PageHeader } from '@/components/ui/PageHeader';
import { CardGrid } from '@/components/ui/CardGrid';
import { CountStatTile } from '@/components/ui/CountStatTile';
import { NotificationSection, type NotifyItem } from '@/components/ui/NotificationSection';
import { ContractProgressMini } from '@/features/progress/components/ContractProgressMini';
import { getStepsForContract } from '@/features/progress/utils/progress.utils';
import { formatNumber, toPersianDigits } from '@/utils/format';

/** داشبورد زنجیره‌دار — پایش اکوسیستم + صندوق اقدامات (تطبیق درخواست و پیگیری هماهنگی). */
export function AdminDashboard() {
  const navigate = useNavigate();
  const { data } = useData();
  const requests = data.requests;
  const contracts = data.contracts;

  const pending = requests.filter((r) => r.status === 'pending');
  const awaiting = contracts.filter((c) => c.status === 'awaiting_farm');
  const finalized = contracts.filter((c) => c.status === 'finalized');

  // تولید پیش‌بینی‌شده = جمع تولید قراردادهای دارای برآورد (بدون ردشده‌ها)
  const production = requests
    .filter((r) => r.estimation && r.status !== 'rejected')
    .reduce((sum, r) => sum + (r.estimation?.productionKg ?? 0), 0);
  const sharePercents = requests.filter((r) => r.estimation).map((r) => r.estimation!.supplierSharePercent);
  const avgShare = sharePercents.length
    ? Math.round(sharePercents.reduce((a, b) => a + b, 0) / sharePercents.length)
    : 0;

  const stats = [
    { label: 'درخواست‌های در انتظار', value: pending.length, tone: 'warning' as const, onClick: () => navigate('/admin/requests') },
    { label: 'در انتظار تأیید مزرعه', value: awaiting.length, tone: 'neutral' as const, onClick: () => navigate('/admin/contracts') },
    { label: 'قراردادهای جاری', value: finalized.length, tone: 'info' as const, onClick: () => navigate('/admin/contracts') },
    { label: 'تولید پیش‌بینی‌شده', value: production, suffix: 'کیلوگرم', tone: 'purple' as const },
  ];

  const actions: NotifyItem[] = [
    ...pending.map((r) => ({
      id: `pending-${r.id}`,
      title: 'در انتظار تطبیق مزرعه',
      body: `${formatNumber(r.desiredKg)} کیلوگرم مرغ زنده — ${r.province}، تحویل ${toPersianDigits(r.targetDeliveryDate)}`,
      onClick: () => navigate(`/admin/requests/${r.id}`),
      buttonLabel: 'تطبیق و برآورد سهم',
    })),
    ...awaiting.map((c) => ({
      id: `awaiting-${c.id}`,
      title: 'مزرعه هنوز هماهنگی را تأیید نکرده',
      body: `${c.name} — ${c.farmName}`,
      onClick: () => navigate('/admin/contracts'),
    })),
  ];

  const infos: NotifyItem[] = [
    ...finalized.map((c) => ({
      id: `monitor-${c.id}`,
      title: c.name,
      body: <ContractProgressMini steps={getStepsForContract(data.progressSteps, c.id)} />,
      onClick: () => navigate(`/admin/contracts/${c.id}/progress`),
      buttonLabel: 'پایش قرارداد',
    })),
    ...(avgShare > 0 ? [{
      id: 'avg-share',
      title: 'میانگین سهم مشارکت‌کننده',
      body: `٪${formatNumber(avgShare)} در قراردادهای دارای برآورد`,
    }] : []),
  ];

  return (
    <PageFrame header={<PageHeader title="داشبورد زنجیره‌دار" subtitle="پایش اکوسیستم و تطبیق درخواست‌ها" />}>
      <CardGrid minWidth={220} gap={12}>
        {stats.map((s) => <CountStatTile key={s.label} direction="column" {...s} />)}
      </CardGrid>
      <NotificationSection title="نیازمند اقدام شما" kind="action" items={actions} />
      <NotificationSection title="پایش و اطلاعیه‌ها" kind="info" items={infos} />
      {actions.length === 0 && infos.length === 0 && (
        <Empty description="همه‌چیز مرتب است — درخواست در انتظاری ندارید" />
      )}
    </PageFrame>
  );
}
