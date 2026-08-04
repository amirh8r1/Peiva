import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Card, Typography, Tag, Empty, Badge, Space } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { useData } from '@/context/DataContext';
import { PageHeader } from '@/components/ui/PageHeader';
import { formatNumber } from '@/utils/format';
import { CONTRACT_TYPE_LABELS } from '@/types';

const { Text, Title } = Typography;

function useIsSupplier() { return useLocation().pathname.startsWith('/supplier'); }

function FarmOwnerDashboard() {
  const navigate = useNavigate();
  const { data } = useData();
  const myProposals = data.proposals.filter((p) => p.farmId === 'farm-1');
  const finIds = new Set(data.contracts.filter((c) => c.status === 'finalized').map((c) => c.id));
  const needCollateral = myProposals.filter((p) => p.status === 'accepted' && !finIds.has(p.contractId));
  const sentContracts = data.contracts.filter((c) => c.status === 'sent' && !finIds.has(c.id));
  const finalized = data.contracts.filter((c) => c.status === 'finalized');

  return (
    <>
      <PageHeader title="داشبورد مزرعه‌دار" extra={
        needCollateral.length > 0 ? <Badge count={formatNumber(needCollateral.length)}><BellOutlined style={{ fontSize: 20, color: '#faad14' }} /></Badge> : null
      } />
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {needCollateral.length > 0 && needCollateral.map((p) => (
          <Card key={p.id} style={{ marginBottom: 10, background: '#fff7e6', borderRadius: 10, border: '1px solid #faad14' }}
            onClick={() => navigate(`/farm/collateral/${p.contractId}`)}>
            <Space><Badge status="warning" /><Text strong>در انتظار تأمین تضامین</Text></Space>
            <Text style={{ display: 'block', marginTop: 4 }}>{p.contractName} — تأیید شده</Text>
            <Button type="primary" size="small" block style={{ marginTop: 8 }}>تأمین تضامین</Button>
          </Card>
        ))}
        {sentContracts.length > 0 && (
          <Card style={{ marginBottom: 10, background: '#e6f7ff', borderRadius: 10, border: '1px solid #1677ff' }}
            onClick={() => navigate('/farm/proposals')}>
            <Space><Badge status="processing" /><Text strong>قراردادهای جدید</Text></Space>
            <Text style={{ display: 'block', marginTop: 4 }}>{formatNumber(sentContracts.length)} قرارداد جدید برای بررسی</Text>
            <Button size="small" block style={{ marginTop: 8 }}>مشاهده</Button>
          </Card>
        )}
        {finalized.length > 0 && (
          <Card size="small" style={{ marginBottom: 10, background: '#f6ffed', borderRadius: 10 }}>
            <Space><Badge status="success" /><Text strong>قراردادهای نهایی</Text></Space>
            <Text style={{ display: 'block', marginTop: 4 }}>{formatNumber(finalized.length)} قرارداد</Text>
          </Card>
        )}
        {needCollateral.length === 0 && sentContracts.length === 0 && finalized.length === 0 && (
          <Empty description="نوتیف جدیدی ندارید" />
        )}
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

  return (
    <>
      <PageHeader title="داشبورد تأمین‌کننده" />
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {sent.length > 0 && sent.map((c) => (
          <Card key={c.id} style={{ marginBottom: 10, background: '#e6f7ff', borderRadius: 10, border: '1px solid #1677ff' }}>
            <Space><Badge status="processing" /><Text strong>{c.name}</Text></Space>
            <div style={{ marginTop: 4 }}><Tag>{CONTRACT_TYPE_LABELS[c.contractType]}</Tag><Text style={{ fontSize: 11 }}>{c.region} | {formatNumber(c.duration)} دوره</Text></div>
          </Card>
        ))}

        {acceptedCount > 0 && (
          <Card style={{ marginBottom: 10, background: '#fff7e6', borderRadius: 10, border: '1px solid #faad14' }}>
            <Space><Badge status="warning" /><Text strong>در انتظار وثیقه</Text></Space>
            <Text style={{ display: 'block', marginTop: 4 }}>{formatNumber(acceptedCount)} مزرعه‌دار تأیید شده</Text>
          </Card>
        )}

        {finalized.length > 0 && (
          <Card size="small" style={{ marginBottom: 10, background: '#f6ffed', borderRadius: 10 }}>
            <Space><Badge status="success" /><Text strong>قراردادهای نهایی</Text></Space>
            <Text style={{ display: 'block', marginTop: 4 }}>{formatNumber(finalized.length)} قرارداد</Text>
          </Card>
        )}

        {contracts.length === 0 && <Empty description="قراردادی ندارید" />}
      </div>
    </>
  );
}

export function DashboardPage() {
  return useIsSupplier() ? <SupplierDashboard /> : <FarmOwnerDashboard />;
}
