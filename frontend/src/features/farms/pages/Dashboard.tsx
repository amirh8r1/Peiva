import { useNavigate } from 'react-router-dom';
import { Button, Card, Typography, Tag, Empty, Badge, Space } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { useData } from '@/context/DataContext';
import { PageHeader } from '@/components/ui/PageHeader';
import { formatNumber } from '@/utils/format';
import { CONTRACT_TYPE_LABELS } from '@/types';
import { useIsDesktop } from '@/hooks/useResponsive';
import { useRole } from '@/hooks/useRole';
import { responsiveGrid } from '@/utils/responsive';
import { getPendingActions, getWeightRequestActions } from '@/features/progress/utils/progress.utils';

const { Text } = Typography;

/** آیتم نوتیف یکپارچه داشبورد — همه انواع نوتیف به این شکل نرمال می‌شوند. */
interface NotifyItem {
  id: string;
  title: string;
  body: React.ReactNode;
  onClick?: () => void;
  buttonLabel?: string;
}

type NotifyKind = 'action' | 'info';

/** کارت نوتیف — action: زرد هشدار (نیازمند اقدام)؛ info: خنثی (اطلاع‌رسانی). */
function NotifyCard({ title, body, onClick, buttonLabel, kind }: NotifyItem & { kind: NotifyKind }) {
  const isDesktop = useIsDesktop();
  const isAction = kind === 'action';
  return (
    <Card
      style={{
        marginBottom: isDesktop ? 0 : 10,
        background: isAction ? '#fff7e6' : '#fafafa',
        borderRadius: 10,
        border: `1px solid ${isAction ? '#faad14' : '#d9d9d9'}`,
        cursor: onClick ? 'pointer' : 'default',
      }}
      onClick={onClick}
    >
      <Space><Badge status={isAction ? 'warning' : 'default'} /><Text strong>{title}</Text></Space>
      <div style={{ marginTop: 4, fontSize: 12, color: 'rgba(0,0,0,0.88)' }}>{body}</div>
      {onClick && (
        <Button type={isAction ? 'primary' : 'default'} size="small" block style={{ marginTop: 8 }}>
          {buttonLabel ?? (isAction ? 'پیگیری' : 'مشاهده')}
        </Button>
      )}
    </Card>
  );
}

/** سکشن نوتیف با عنوان + شمارنده و گرید ریسپانسیو — سازماندهی واحد داشبوردها. */
function NotificationSection({ title, kind, items }: { title: string; kind: NotifyKind; items: NotifyItem[] }) {
  const isDesktop = useIsDesktop();
  if (items.length === 0) return null;
  return (
    <div style={{ marginBottom: 16 }}>
      <Space size={6} style={{ marginBottom: 8 }}>
        <Text strong style={{ fontSize: 13 }}>{title}</Text>
        <Badge count={formatNumber(items.length)} size="small" style={{ backgroundColor: kind === 'action' ? '#faad14' : '#bfbfbf' }} />
      </Space>
      <div style={isDesktop ? responsiveGrid(320, 12) : undefined}>
        {items.map((item) => <NotifyCard key={item.id} kind={kind} {...item} />)}
      </div>
    </div>
  );
}

/** تبدیل آیتم‌های فلو پراگرس و درخواست وزن به NotifyItem مشترک. */
function toNotifyItems(
  actions: { id: string; contractId: string; contractName: string; title?: string; stepLabel?: string; verb: string; kind: NotifyKind }[],
  navigateTo: (contractId: string) => void,
): NotifyItem[] {
  return actions.map((a) => ({
    id: a.id,
    title: a.title ?? a.stepLabel ?? '',
    body: `${a.contractName} — ${a.verb}`,
    onClick: () => navigateTo(a.contractId),
  }));
}

function FarmOwnerDashboard() {
  const navigate = useNavigate();
  const { data } = useData();
  const myProposals = data.proposals.filter((p) => p.farmId === 'farm-1');
  const finIds = new Set(data.contracts.filter((c) => c.status === 'finalized').map((c) => c.id));
  const needCollateral = myProposals.filter((p) => p.status === 'accepted' && !finIds.has(p.contractId));
  const sentContracts = data.contracts.filter((c) => c.status === 'sent' && !finIds.has(c.id));
  const finalized = data.contracts.filter((c) => c.status === 'finalized');

  const progress = getPendingActions(data, 'farm');
  const weights = getWeightRequestActions(data, 'farm');

  const actions: NotifyItem[] = [
    ...toNotifyItems(progress.filter((p) => p.kind === 'action'), (cid) => navigate(`/farm/contracts/${cid}/progress`)),
    ...toNotifyItems(weights.filter((w) => w.kind === 'action'), (cid) => navigate(`/farm/contracts/${cid}/progress?tab=weight`)),
    ...needCollateral.map((p) => ({
      id: `collateral-${p.id}`,
      title: 'در انتظار تأمین تضامین',
      body: `${p.contractName} — تأیید شده`,
      onClick: () => navigate(`/farm/collateral/${p.contractId}`),
      buttonLabel: 'تأمین تضامین',
    })),
    ...(sentContracts.length > 0 ? [{
      id: 'new-contracts',
      title: 'قراردادهای جدید',
      body: `${formatNumber(sentContracts.length)} قرارداد جدید برای بررسی`,
      onClick: () => navigate('/farm/proposals'),
      buttonLabel: 'بررسی قراردادها',
    }] : []),
  ];

  const infos: NotifyItem[] = [
    ...toNotifyItems(progress.filter((p) => p.kind === 'info'), (cid) => navigate(`/farm/contracts/${cid}/progress`)),
    ...(finalized.length > 0 ? [{
      id: 'finalized-count',
      title: 'قراردادهای نهایی',
      body: `${formatNumber(finalized.length)} قرارداد`,
      onClick: () => navigate('/farm/contracts'),
      buttonLabel: 'مشاهده قراردادها',
    }] : []),
  ];

  return (
    <>
      <PageHeader title="داشبورد مزرعه‌دار" extra={
        actions.length > 0 ? <Badge count={formatNumber(actions.length)}><BellOutlined style={{ fontSize: 20, color: '#faad14' }} /></Badge> : null
      } />
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <NotificationSection title="نیازمند اقدام شما" kind="action" items={actions} />
        <NotificationSection title="اطلاعیه‌ها" kind="info" items={infos} />
        {actions.length === 0 && infos.length === 0 && <Empty description="نوتیف جدیدی ندارید" />}
      </div>
    </>
  );
}

function SupplierDashboard() {
  const navigate = useNavigate();
  const { data } = useData();
  const contracts = data.contracts;
  const sent = contracts.filter((c) => c.status === 'sent');
  const finalized = contracts.filter((c) => c.status === 'finalized');
  const finIds = new Set(finalized.map((c) => c.id));
  const acceptedCount = data.proposals.filter((p) => p.status === 'accepted' && !finIds.has(p.contractId)).length;

  const progress = getPendingActions(data, 'supplier');
  const weights = getWeightRequestActions(data, 'supplier');

  const actions: NotifyItem[] = [
    ...toNotifyItems(progress.filter((p) => p.kind === 'action'), (cid) => navigate(`/supplier/contracts/${cid}/progress`)),
    ...toNotifyItems(weights.filter((w) => w.kind === 'action'), (cid) => navigate(`/supplier/contracts/${cid}/progress?tab=weight`)),
  ];

  const infos: NotifyItem[] = [
    ...toNotifyItems(progress.filter((p) => p.kind === 'info'), (cid) => navigate(`/supplier/contracts/${cid}/progress`)),
    ...sent.map((c) => ({
      id: `sent-${c.id}`,
      title: c.name,
      body: <span><Tag>{CONTRACT_TYPE_LABELS[c.contractType]}</Tag><Text style={{ fontSize: 11 }}>{c.region} | {formatNumber(c.duration)} دوره</Text></span>,
      onClick: () => navigate('/supplier/contracts'),
    })),
    ...(acceptedCount > 0 ? [{
      id: 'pending-collateral',
      title: 'در انتظار وثیقه',
      body: `${formatNumber(acceptedCount)} مزرعه‌دار تأیید شده`,
      onClick: () => navigate('/supplier/contracts'),
    }] : []),
    ...(finalized.length > 0 ? [{
      id: 'finalized-count',
      title: 'قراردادهای نهایی',
      body: `${formatNumber(finalized.length)} قرارداد`,
      onClick: () => navigate('/supplier/contracts'),
      buttonLabel: 'مشاهده قراردادها',
    }] : []),
  ];

  return (
    <>
      <PageHeader title="داشبورد تأمین‌کننده" />
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <NotificationSection title="نیازمند اقدام شما" kind="action" items={actions} />
        <NotificationSection title="اطلاعیه‌ها" kind="info" items={infos} />
        {actions.length === 0 && infos.length === 0 && (
          <Empty description={contracts.length === 0 ? 'قراردادی ندارید' : 'نوتیف جدیدی ندارید'} />
        )}
      </div>
    </>
  );
}

export function DashboardPage() {
  return useRole() === 'supplier' ? <SupplierDashboard /> : <FarmOwnerDashboard />;
}
