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
import { getPendingActions } from '@/features/progress/utils/progress.utils';
import type { ProgressRole } from '@/types';

const { Text } = Typography;

/** بخش «پیگیری قراردادها» — آیتم‌های قابل اقدام فلو پراگرس (مشترک بین دو نقش). */
function ProgressFollowups({ role }: { role: ProgressRole }) {
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();
  const { data } = useData();
  const pending = getPendingActions(data, role);
  if (pending.length === 0) return null;

  return (
    <>
      <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 8 }}>پیگیری قراردادها</Text>
      <div style={isDesktop ? responsiveGrid(320, 12) : undefined}>
        {pending.map((a) => (
          <Card key={a.id}
            style={{ marginBottom: isDesktop ? 0 : 10, background: '#fff7e6', borderRadius: 10, border: '1px solid #faad14', cursor: 'pointer' }}
            onClick={() => navigate(`/${role}/contracts/${a.contractId}/progress`)}>
            <Space><Badge status="warning" /><Text strong>{a.stepLabel}</Text></Space>
            <Text style={{ display: 'block', marginTop: 4, fontSize: 12 }}>{a.contractName} — {a.verb}</Text>
            <Button type="primary" size="small" block style={{ marginTop: 8 }}>پیگیری</Button>
          </Card>
        ))}
      </div>
    </>
  );
}

function FarmOwnerDashboard() {
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();
  const { data } = useData();
  const myProposals = data.proposals.filter((p) => p.farmId === 'farm-1');
  const finIds = new Set(data.contracts.filter((c) => c.status === 'finalized').map((c) => c.id));
  const needCollateral = myProposals.filter((p) => p.status === 'accepted' && !finIds.has(p.contractId));
  const sentContracts = data.contracts.filter((c) => c.status === 'sent' && !finIds.has(c.id));
  const finalized = data.contracts.filter((c) => c.status === 'finalized');
  const hasAny = needCollateral.length > 0 || sentContracts.length > 0 || finalized.length > 0;

  return (
    <>
      <PageHeader title="داشبورد مزرعه‌دار" extra={
        needCollateral.length > 0 ? <Badge count={formatNumber(needCollateral.length)}><BellOutlined style={{ fontSize: 20, color: '#faad14' }} /></Badge> : null
      } />
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <ProgressFollowups role="farm" />
        {hasAny && (
          <div style={isDesktop ? responsiveGrid(320, 12) : undefined}>
            {needCollateral.length > 0 && needCollateral.map((p) => (
              <Card key={p.id} style={{ marginBottom: isDesktop ? 0 : 10, background: '#fff7e6', borderRadius: 10, border: '1px solid #faad14' }}
                onClick={() => navigate(`/farm/collateral/${p.contractId}`)}>
                <Space><Badge status="warning" /><Text strong>در انتظار تأمین تضامین</Text></Space>
                <Text style={{ display: 'block', marginTop: 4 }}>{p.contractName} — تأیید شده</Text>
                <Button type="primary" size="small" block style={{ marginTop: 8 }}>تأمین تضامین</Button>
              </Card>
            ))}
            {sentContracts.length > 0 && (
              <Card style={{ marginBottom: isDesktop ? 0 : 10, background: '#e6f7ff', borderRadius: 10, border: '1px solid #1677ff' }}
                onClick={() => navigate('/farm/proposals')}>
                <Space><Badge status="processing" /><Text strong>قراردادهای جدید</Text></Space>
                <Text style={{ display: 'block', marginTop: 4 }}>{formatNumber(sentContracts.length)} قرارداد جدید برای بررسی</Text>
                <Button size="small" block style={{ marginTop: 8 }}>مشاهده</Button>
              </Card>
            )}
            {finalized.length > 0 && (
              <Card size="small" style={{ marginBottom: isDesktop ? 0 : 10, background: '#f6ffed', borderRadius: 10 }}>
                <Space><Badge status="success" /><Text strong>قراردادهای نهایی</Text></Space>
                <Text style={{ display: 'block', marginTop: 4 }}>{formatNumber(finalized.length)} قرارداد</Text>
              </Card>
            )}
          </div>
        )}
        {!hasAny && <Empty description="نوتیف جدیدی ندارید" />}
      </div>
    </>
  );
}

function SupplierDashboard() {
  const isDesktop = useIsDesktop();
  const { data } = useData();
  const contracts = data.contracts;
  const sent = contracts.filter((c) => c.status === 'sent');
  const finalized = contracts.filter((c) => c.status === 'finalized');
  const finIds = new Set(finalized.map((c) => c.id));
  const acceptedCount = data.proposals.filter((p) => p.status === 'accepted' && !finIds.has(p.contractId)).length;
  const hasAny = sent.length > 0 || acceptedCount > 0 || finalized.length > 0;

  return (
    <>
      <PageHeader title="داشبورد تأمین‌کننده" />
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <ProgressFollowups role="supplier" />
        {hasAny && (
          <div style={isDesktop ? responsiveGrid(320, 12) : undefined}>
            {sent.length > 0 && sent.map((c) => (
              <Card key={c.id} style={{ marginBottom: isDesktop ? 0 : 10, background: '#e6f7ff', borderRadius: 10, border: '1px solid #1677ff' }}>
                <Space><Badge status="processing" /><Text strong>{c.name}</Text></Space>
                <div style={{ marginTop: 4 }}><Tag>{CONTRACT_TYPE_LABELS[c.contractType]}</Tag><Text style={{ fontSize: 11 }}>{c.region} | {formatNumber(c.duration)} دوره</Text></div>
              </Card>
            ))}

            {acceptedCount > 0 && (
              <Card style={{ marginBottom: isDesktop ? 0 : 10, background: '#fff7e6', borderRadius: 10, border: '1px solid #faad14' }}>
                <Space><Badge status="warning" /><Text strong>در انتظار وثیقه</Text></Space>
                <Text style={{ display: 'block', marginTop: 4 }}>{formatNumber(acceptedCount)} مزرعه‌دار تأیید شده</Text>
              </Card>
            )}

            {finalized.length > 0 && (
              <Card size="small" style={{ marginBottom: isDesktop ? 0 : 10, background: '#f6ffed', borderRadius: 10 }}>
                <Space><Badge status="success" /><Text strong>قراردادهای نهایی</Text></Space>
                <Text style={{ display: 'block', marginTop: 4 }}>{formatNumber(finalized.length)} قرارداد</Text>
              </Card>
            )}
          </div>
        )}

        {contracts.length === 0 && <Empty description="قراردادی ندارید" />}
      </div>
    </>
  );
}

export function DashboardPage() {
  return useRole() === 'supplier' ? <SupplierDashboard /> : <FarmOwnerDashboard />;
}
