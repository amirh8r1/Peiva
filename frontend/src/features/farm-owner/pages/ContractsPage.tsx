import { useQuery } from '@tanstack/react-query';
import { Card, Tag, Typography, Empty, Spin, List, Steps } from 'antd';
import { contractService } from '@/features/contracts/services/contract.service';
import { PageHeader } from '@/components/ui/PageHeader';
import { CHAIN_TRACKING_STEPS, getTrackingStepIndex } from '@/types';
import type { Chain } from '@/types';
import { chainService } from '@/features/chains/services/chain.service';

const { Text, Title } = Typography;

export function FarmOwnerContractsPage() {
  const { data: contracts, isLoading } = useQuery({
    queryKey: ['contracts'],
    queryFn: () => contractService.getAll(),
  });

  const finalized = contracts?.filter((c) => c.status === 'finalized') ?? [];
  const active = contracts?.filter((c) => c.status === 'sent' || c.status === 'negotiating' || c.status === 'approved') ?? [];

  return (
    <>
      <PageHeader title="قراردادهای جاری" subtitle="قراردادهای فعال و نهایی شده" />

      {isLoading ? (
        <Spin />
      ) : (
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {finalized.length > 0 && (
            <>
              <Title level={5} style={{ marginBottom: 8 }}>✅ نهایی شده</Title>
              <List
                dataSource={finalized}
                renderItem={(c) => (
                  <Card size="small" style={{ marginBottom: 8, borderRadius: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text strong>{c.chainName}</Text>
                      <Tag color="success">نهایی شده</Tag>
                    </div>
                  </Card>
                )}
              />
            </>
          )}

          {active.length > 0 && (
            <>
              <Title level={5} style={{ marginBottom: 8, marginTop: 16 }}>⏳ در حال پیگیری</Title>
              <List
                dataSource={active}
                renderItem={(c) => (
                  <Card size="small" style={{ marginBottom: 8, borderRadius: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text strong>{c.chainName}</Text>
                      <Tag color="processing">{c.status === 'sent' ? 'ارسال شده' : 'در مذاکره'}</Tag>
                    </div>
                  </Card>
                )}
              />
            </>
          )}

          {finalized.length === 0 && active.length === 0 && (
            <Empty description="قرارداد جاری ندارید" />
          )}
        </div>
      )}
    </>
  );
}
