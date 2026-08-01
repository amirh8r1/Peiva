import { useNavigate } from 'react-router-dom';
import { Card, Tag, Typography, Empty, List } from 'antd';
import { useData } from '@/context/DataContext';
import { PageHeader } from '@/components/ui/PageHeader';
import { formatNumber } from '@/utils/format';
import { CONTRACT_TYPE_LABELS } from '@/types';

const { Text, Title } = Typography;

export function FarmOwnerContractsPage() {
  const navigate = useNavigate();
  const { data } = useData();

  const finalized = data.contracts.filter((c) => c.status === 'finalized');
  const myProposals = data.proposals.filter((p) => p.farmId === 'farm-1');
  const active = data.contracts.filter((c) => {
    const mp = myProposals.find((p) => p.contractId === c.id);
    return c.status !== 'finalized' && mp;
  });

  return (
    <>
      <PageHeader title="قراردادهای جاری" subtitle="قراردادهای فعال و نهایی شده" />

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {finalized.length > 0 && (
          <>
            <Title level={5}>✅ نهایی شده</Title>
            <List dataSource={finalized} renderItem={(c) => (
              <Card size="small" style={{ marginBottom: 6, borderRadius: 8, background: '#f6ffed' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <Text strong>{c.name}</Text>
                    <Tag style={{ marginRight: 6 }}>{CONTRACT_TYPE_LABELS[c.contractType]}</Tag>
                  </div>
                  <Tag color="success">نهایی شده</Tag>
                </div>
                <Text type="secondary" style={{ fontSize: 11 }}>{c.createdAt}</Text>
              </Card>
            )} />
          </>
        )}

        {active.length > 0 && (
          <>
            <Title level={5} style={{ marginTop: 16 }}>⏳ در حال پیگیری</Title>
            {active.map((c) => {
              const mp = myProposals.find((p) => p.contractId === c.id);
              return (
                <Card key={c.id} size="small" style={{ marginBottom: 6, borderRadius: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text strong>{c.name}</Text>
                    <Tag color={mp?.status === 'accepted' ? 'warning' : 'processing'}>
                      {mp?.status === 'accepted' ? 'در انتظار وثیقه' : mp?.status === 'pending' ? 'در انتظار بررسی' : c.status}
                    </Tag>
                  </div>
                  {mp && <Text type="secondary" style={{ fontSize: 11 }}>پیشنهاد شما: ٪{formatNumber(mp.proposedPercentage)}</Text>}
                </Card>
              );
            })}
          </>
        )}

        {finalized.length === 0 && active.length === 0 && <Empty description="قرارداد جاری ندارید" />}
      </div>
    </>
  );
}
