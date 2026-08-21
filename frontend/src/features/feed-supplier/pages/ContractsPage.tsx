import { useNavigate } from 'react-router-dom';
import { Card, Tag, Typography, Empty, List } from 'antd';
import { useData } from '@/context/DataContext';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageFrame } from '@/components/ui/PageFrame';
import { formatNumber } from '@/utils/format';
import { CONTRACT_TYPE_LABELS } from '@/types';
import { useIsDesktop } from '@/hooks/useResponsive';
import { ContractProgressMini } from '@/features/progress/components/ContractProgressMini';
import { getStepsForContract } from '@/features/progress/utils/progress.utils';
import type { Contract } from '@/types';

const { Text } = Typography;

export function SupplierContractsPage() {
  const { data } = useData();
  const isDesktop = useIsDesktop();
  const navigate = useNavigate();

  return (
    <PageFrame header={<PageHeader title="قراردادها" />}>
      {data.contracts.length > 0 ? (
        <List dataSource={data.contracts} grid={{ gutter: [12, isDesktop ? 12 : 8], xs: 1, md: 2, xl: 3 }} renderItem={(c: Contract) => (
          <Card size="small" style={{ cursor: c.status === 'finalized' ? 'pointer' : 'default' }}
            hoverable={c.status === 'finalized'}
            onClick={() => c.status === 'finalized' && navigate(`/supplier/contracts/${c.id}/progress`)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text strong>{c.name}</Text>
              <Tag color={c.status === 'sent' ? 'processing' : c.status === 'finalized' ? 'success' : 'default'}>
                {c.status === 'sent' ? 'ارسال شده' : c.status === 'finalized' ? 'نهایی' : 'پیش‌نویس'}
              </Tag>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Tag>{CONTRACT_TYPE_LABELS[c.contractType]}</Tag>
              <Text style={{ fontSize: 11 }}>{c.region}</Text>
              <Text style={{ fontSize: 11 }}>{formatNumber(c.duration)} دوره</Text>
              <Text style={{ fontSize: 11 }}>{formatNumber(c.selectedFarmIds.length)} مزرعه</Text>
            </div>
              <Text type="secondary" style={{ fontSize: 10, display: 'block', marginTop: 4 }}>{c.createdAt}</Text>
            {c.status === 'finalized' && (
              <>
                <ContractProgressMini steps={getStepsForContract(data.progressSteps, c.id)} />
                <Tag color="geekblue" style={{ marginTop: 6, fontSize: 10 }}>پیگیری مراحل تحویل ←</Tag>
              </>
            )}
          </Card>
        )} />
      ) : (
        <Empty description="قراردادی ندارید" />
      )}
    </PageFrame>
  );
}
