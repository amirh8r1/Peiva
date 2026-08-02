import { Card, Tag, Typography, Empty, List } from 'antd';
import { useData } from '@/context/DataContext';
import { PageHeader } from '@/components/ui/PageHeader';
import { formatNumber } from '@/utils/format';
import { CONTRACT_TYPE_LABELS } from '@/types';

const { Text, Title } = Typography;

export function FarmOwnerContractsPage() {
  const { data } = useData();
  const fin = data.contracts.filter((c) => c.status === 'finalized');

  return (
    <>
      <PageHeader title="قراردادهای جاری" />
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {fin.length > 0 ? <List dataSource={fin} renderItem={(c) => (
          <Card size="small" style={{ marginBottom: 8, borderRadius: 8, background: '#f6ffed' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div><Text strong>{c.name}</Text><Tag style={{ marginRight: 6 }}>{CONTRACT_TYPE_LABELS[c.contractType]}</Tag></div>
              <Tag color="success">نهایی</Tag>
            </div>
            <Text type="secondary" style={{ fontSize: 11 }}>{c.region} | {formatNumber(c.duration)} دوره | {c.createdAt}</Text>
          </Card>
        )} /> : <Empty description="قرارداد نهایی ندارید" />}
      </div>
    </>
  );
}
