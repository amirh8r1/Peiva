import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button, Empty, Spin, List, Card, Typography, Tag } from 'antd';
import { PlusOutlined, EyeOutlined } from '@ant-design/icons';
import { useRole } from '@/context/RoleContext';
import { chainService } from '@/features/chains/services/chain.service';
import { proposalService, contractService } from '@/features/contracts/services/contract.service';
import { ChainCard } from '@/components/ui/ChainCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { formatNumber } from '@/utils/format';
import type { Chain, FarmProposal } from '@/types';

const { Text, Title } = Typography;

function FarmOwnerDashboard() {
  const navigate = useNavigate();
  const { data: proposals, isLoading } = useQuery({
    queryKey: ['proposals'],
    queryFn: () => proposalService.getByFarmId('farm-1'),
  });

  const pending = proposals?.filter((p) => p.status === 'accepted') ?? [];
  const all = proposals ?? [];

  return (
    <>
      <PageHeader title="داشبورد مزرعه‌دار" subtitle={`${all.length} قرارداد پیشنهادی`} />

      {isLoading ? (
        <Spin />
      ) : (
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {pending.length > 0 && (
            <Card style={{ marginBottom: 12, background: '#fff7e6', borderRadius: 10 }}>
              <Text strong>⚠️ {formatNumber(pending.length)} قرارداد در انتظار تأمین وثیقه</Text>
              <Button size="small" type="primary" style={{ display: 'block', marginTop: 8 }} onClick={() => navigate('/proposals')}>
                مشاهده و اقدام
              </Button>
            </Card>
          )}

          <Title level={5}>قراردادهای پیشنهادی</Title>
          <List
            dataSource={all.slice(0, 3)}
            renderItem={(p: FarmProposal) => (
              <Card hoverable size="small" style={{ marginBottom: 8, borderRadius: 8 }} onClick={() => navigate(`/proposals/${p.id}`)}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <Text strong>{p.contractName}</Text>
                    <div>
                      <Text type="secondary" style={{ fontSize: 11 }}>درصد: ٪{formatNumber(p.proposedPercentage)}</Text>
                    </div>
                  </div>
                  <Tag color={p.status === 'accepted' ? 'success' : p.status === 'rejected' ? 'error' : 'processing'}>
                    {p.status === 'accepted' ? 'تأیید شده' : p.status === 'rejected' ? 'رد شده' : 'در انتظار'}
                  </Tag>
                </div>
              </Card>
            )}
          />
          {all.length > 3 && (
            <Button type="link" block onClick={() => navigate('/proposals')}>مشاهده همه</Button>
          )}
        </div>
      )}
    </>
  );
}

function FeedSupplierDashboard() {
  const navigate = useNavigate();
  const { data: chains, isLoading } = useQuery({
    queryKey: ['chains'],
    queryFn: () => chainService.getAll(),
  });

  const { data: contracts } = useQuery({
    queryKey: ['contracts'],
    queryFn: () => contractService.getAll(),
  });

  const activeContracts = contracts?.filter((c) => c.status !== 'finalized') ?? [];

  return (
    <>
      <PageHeader
        title="داشبورد تأمین‌کننده"
        subtitle="مدیریت زنجیره‌ها و قراردادها"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/chains/new')}>
            زنجیره جدید
          </Button>
        }
      />

      {isLoading ? (
        <Spin />
      ) : (
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {chains && chains.length > 0 ? (
            <>
              <Title level={5} style={{ marginBottom: 8 }}>زنجیره‌های فعال</Title>
              {chains.map((chain: Chain) => (
                <ChainCard key={chain.id} chain={chain} />
              ))}
            </>
          ) : (
            <Empty description="هنوز زنجیره‌ای نساخته‌اید" />
          )}

          {activeContracts.length > 0 && (
            <Button block type="primary" style={{ marginTop: 16 }} onClick={() => navigate('/contracts')}>
              {formatNumber(activeContracts.length)} قرارداد فعال — مشاهده
            </Button>
          )}
        </div>
      )}
    </>
  );
}

export function DashboardPage() {
  const { role } = useRole();
  return role === 'farm-owner' ? <FarmOwnerDashboard /> : <FeedSupplierDashboard />;
}
