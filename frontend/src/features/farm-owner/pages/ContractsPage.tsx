import { useNavigate } from 'react-router-dom';
import { Card, Tag, Typography, Empty, List, theme } from 'antd';
import { useData } from '@/context/DataContext';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageFrame } from '@/components/ui/PageFrame';
import { formatNumber } from '@/utils/format';
import { CONTRACT_TYPE_LABELS } from '@/types';
import { useIsDesktop } from '@/hooks/useResponsive';
import { ContractProgressMini } from '@/features/progress/components/ContractProgressMini';
import { getStepsForContract } from '@/features/progress/utils/progress.utils';

const { Text } = Typography;

export function FarmOwnerContractsPage() {
  const { data } = useData();
  const isDesktop = useIsDesktop();
  const navigate = useNavigate();
  const { token } = theme.useToken();
  const fin = data.contracts.filter((c) => c.status === 'finalized');

  return (
    <PageFrame header={<PageHeader title="قراردادهای جاری" />}>
      {fin.length > 0 ? <List dataSource={fin} grid={{ gutter: [12, isDesktop ? 12 : 8], xs: 1, md: 2, xl: 3 }} renderItem={(c) => (
        <Card size="small" hoverable style={{ background: token.colorSuccessBg, cursor: 'pointer' }}
          onClick={() => navigate(`/farm/contracts/${c.id}/progress`)}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div><Text strong>{c.name}</Text><Tag style={{ marginInlineEnd: 6 }}>{CONTRACT_TYPE_LABELS[c.contractType]}</Tag></div>
            <Tag color="success">نهایی</Tag>
          </div>
          <Text type="secondary" style={{ fontSize: 11 }}>{c.region} | {formatNumber(c.duration)} دوره | {c.createdAt}</Text>
          <ContractProgressMini steps={getStepsForContract(data.progressSteps, c.id)} />
          <Tag color="geekblue" style={{ marginTop: 6, fontSize: 10 }}>پیگیری مراحل تحویل ←</Tag>
        </Card>
      )} /> : <Empty description="قرارداد نهایی ندارید" />}
    </PageFrame>
  );
}
