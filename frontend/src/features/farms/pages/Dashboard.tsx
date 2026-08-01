import { useNavigate } from 'react-router-dom';
import { Button, Card, Typography, Tag, List, Empty, Badge, Space } from 'antd';
import { PlusOutlined, BellOutlined } from '@ant-design/icons';
import { useRole } from '@/context/RoleContext';
import { useData } from '@/context/DataContext';
import { PageHeader } from '@/components/ui/PageHeader';
import { formatNumber } from '@/utils/format';
import { CONTRACT_TYPE_LABELS } from '@/types';

const { Text, Title } = Typography;

function FarmOwnerDashboard() {
  const navigate = useNavigate();
  const { data } = useData();
  const myProposals = data.proposals.filter((p) => p.farmId === 'farm-1');
  const finalizedContractIds = new Set(data.contracts.filter((c) => c.status === 'finalized').map((c) => c.id));
  const needCollateral = myProposals.filter((p) => p.status === 'accepted' && !finalizedContractIds.has(p.contractId));
  const openContracts = data.contracts.filter((c) => c.status === 'sent' || c.status === 'negotiating');
  const notBidYet = openContracts.filter((c) => !myProposals.some((p) => p.contractId === c.id));
  const finalized = data.contracts.filter((c) => c.status === 'finalized');

  const totalAlerts = needCollateral.length + notBidYet.length;

  return (
    <>
      <PageHeader title="داشبورد مزرعه‌دار" extra={
        totalAlerts > 0 ? <Badge count={formatNumber(totalAlerts)}><BellOutlined style={{ fontSize: 20, color: '#faad14' }} /></Badge> : null
      } />

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* 🔴 Priority: Collateral needed */}
        {needCollateral.length > 0 && (
          <Card style={{ marginBottom: 10, background: '#fff7e6', borderRadius: 10, border: '1px solid #faad14' }}
            onClick={() => navigate('/proposals')}>
            <Space><Badge status="warning" /><Text strong>در انتظار تأمین وثیقه</Text></Space>
            <Text style={{ display: 'block', marginTop: 4 }}>
              {formatNumber(needCollateral.length)} قرارداد تأیید شده — برای نهایی شدن وثیقه لازم است
            </Text>
            <Button type="primary" size="small" block style={{ marginTop: 8 }}>تأمین وثیقه</Button>
          </Card>
        )}

        {/* 🟡 New contracts to bid on */}
        {notBidYet.length > 0 && (
          <Card style={{ marginBottom: 10, background: '#e6f7ff', borderRadius: 10, border: '1px solid #1677ff' }}
            onClick={() => navigate('/proposals')}>
            <Space><Badge status="processing" /><Text strong>فرصت جدید مناقصه</Text></Space>
            <Text style={{ display: 'block', marginTop: 4 }}>
              {formatNumber(notBidYet.length)} قرارداد جدید — پیشنهاد درصد مشارکت خود را ثبت کنید
            </Text>
            <Button size="small" block style={{ marginTop: 8 }}>مشاهده و ثبت پیشنهاد</Button>
          </Card>
        )}

        {/* Green: finalized */}
        {finalized.length > 0 && (
          <Card size="small" style={{ marginBottom: 10, background: '#f6ffed', borderRadius: 10, border: '1px solid #389e0d' }}>
            <Space><Badge status="success" /><Text strong>قراردادهای نهایی</Text></Space>
            <Text style={{ display: 'block', marginTop: 4 }}>{formatNumber(finalized.length)} قرارداد نهایی شده</Text>
            <Button type="link" size="small" onClick={() => navigate('/contracts')}>مشاهده</Button>
          </Card>
        )}

        {/* Ongoing bids */}
        {myProposals.filter((p) => p.status === 'pending').length > 0 && (
          <>
            <Title level={5} style={{ marginTop: 12, marginBottom: 8 }}>⏳ پیشنهادهای در حال بررسی</Title>
            {myProposals.filter((p) => p.status === 'pending').map((p) => (
              <Card key={p.id} size="small" style={{ marginBottom: 6, borderRadius: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>{p.contractName}</Text>
                  <Tag color="processing">در انتظار</Tag>
                </div>
                <Text type="secondary" style={{ fontSize: 11 }}>پیشنهاد شما: ٪{formatNumber(p.proposedPercentage)}</Text>
              </Card>
            ))}
          </>
        )}

        {totalAlerts === 0 && finalized.length === 0 && (
          <Empty description="نوتیف جدیدی ندارید" />
        )}
      </div>
    </>
  );
}

function FeedSupplierDashboard() {
  const navigate = useNavigate();
  const { data } = useData();
  const contracts = data.contracts;
  const withBids = contracts.filter((c) => c.status === 'negotiating');
  const sent = contracts.filter((c) => c.status === 'sent');
  const finalized = contracts.filter((c) => c.status === 'finalized');
  const finalizedCIds = new Set(data.contracts.filter((c) => c.status === 'finalized').map((c) => c.id));
  const acceptedCount = data.proposals.filter((p) => p.status === 'accepted' && !finalizedCIds.has(p.contractId)).length;
  const totalAlerts = withBids.length + acceptedCount;

  return (
    <>
      <PageHeader title="داشبورد تأمین‌کننده" extra={
        <Space>
          {totalAlerts > 0 && <Badge count={formatNumber(totalAlerts)}><BellOutlined style={{ fontSize: 20, color: '#faad14' }} /></Badge>}
          <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => navigate('/chains/new')}>قرارداد جدید</Button>
        </Space>
      } />

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* 🔴 Contracts with new bids */}
        {withBids.length > 0 && (
          <Card style={{ marginBottom: 10, background: '#e6f7ff', borderRadius: 10, border: '1px solid #1677ff' }}>
            <Space><Badge status="processing" /><Text strong>پیشنهادهای جدید در مناقصه</Text></Space>
            <Text style={{ display: 'block', marginTop: 4 }}>
              {formatNumber(withBids.length)} قرارداد پیشنهاد دریافت کرده‌اند — مزرعه‌داران را بررسی کنید
            </Text>
            <Button type="primary" size="small" block style={{ marginTop: 8 }} onClick={() => navigate('/contracts')}>
              بررسی و تأیید مزرعه‌داران
            </Button>
          </Card>
        )}

        {/* Sent contracts (no bids yet) */}
        {sent.length > 0 && (
          <>
            <Title level={5} style={{ marginBottom: 8 }}>📨 قراردادهای ارسال شده</Title>
            {sent.map((c) => (
              <Card key={c.id} size="small" style={{ marginBottom: 6, borderRadius: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text strong>{c.name}</Text>
                  <Tag color="processing">منتظر پیشنهاد</Tag>
                </div>
                <Text type="secondary" style={{ fontSize: 11 }}>هنوز پیشنهادی دریافت نشده</Text>
              </Card>
            ))}
          </>
        )}

        {/* Pending collateral */}
        {acceptedCount > 0 && (
          <Card style={{ marginBottom: 10, background: '#fff7e6', borderRadius: 10, border: '1px solid #faad14' }}>
            <Space><Badge status="warning" /><Text strong>در انتظار وثیقه</Text></Space>
            <Text style={{ display: 'block', marginTop: 4 }}>
              {formatNumber(acceptedCount)} مزرعه‌دار تأیید شده — منتظر تأمین وثیقه
            </Text>
          </Card>
        )}

        {/* Finalized */}
        {finalized.length > 0 && (
          <Card size="small" style={{ marginBottom: 10, background: '#f6ffed', borderRadius: 10, border: '1px solid #389e0d' }}>
            <Space><Badge status="success" /><Text strong>قراردادهای نهایی شده</Text></Space>
            <Text style={{ display: 'block', marginTop: 4 }}>{formatNumber(finalized.length)} قرارداد</Text>
            <Button type="link" size="small" onClick={() => navigate('/contracts')}>مشاهده</Button>
          </Card>
        )}

        {contracts.length === 0 && <Empty description="هنوز قراردادی ایجاد نکرده‌اید" />}
      </div>
    </>
  );
}

export function DashboardPage() {
  const { role } = useRole();
  return role === 'farm-owner' ? <FarmOwnerDashboard /> : <FeedSupplierDashboard />;
}
