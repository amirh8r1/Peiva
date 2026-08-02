import { useNavigate } from 'react-router-dom';
import { Card, Tag, Typography, Button, Empty, List } from 'antd';
import { useData } from '@/context/DataContext';
import { PageHeader } from '@/components/ui/PageHeader';
import { formatNumber } from '@/utils/format';
import { CONTRACT_TYPE_LABELS } from '@/types';

const { Text, Title } = Typography;

export function ProposalsListPage() {
  const navigate = useNavigate();
  const { data } = useData();
  const finIds = new Set(data.contracts.filter((c) => c.status === 'finalized').map((c) => c.id));
  const needCollateral = data.proposals.filter((p) => p.status === 'accepted' && !finIds.has(p.contractId));
  const sent = data.contracts.filter((c) => c.status === 'sent' && !finIds.has(c.id));
  const finalized = data.contracts.filter((c) => c.status === 'finalized');

  return (
    <>
      <PageHeader title="قراردادهای پیشنهادی" />
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {needCollateral.length > 0 && (
          <>
            <Title level={5}>در انتظار تأمین تضامین</Title>
            {needCollateral.map((p) => (
              <Card key={p.id} style={{ marginBottom: 10, background: '#fff7e6', borderRadius: 10, border: '1px solid #faad14' }}>
                <Text strong>{p.contractName}</Text>
                <Tag color="warning" style={{ float: 'left' }}>تأیید شده</Tag>
                <Button type="primary" size="small" block style={{ marginTop: 8 }}
                  onClick={() => navigate(`/farm/collateral/${p.contractId}`)}>تأمین تضامین</Button>
              </Card>
            ))}
          </>
        )}

        {sent.length > 0 && (
          <>
            <Title level={5} style={{ marginTop: 16 }}>قراردادهای ارسال شده</Title>
            <List dataSource={sent} renderItem={(c) => (
              <Card hoverable size="small" style={{ marginBottom: 6, borderRadius: 8 }} onClick={() => navigate(`/farm/proposals/${c.id}`)}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <Text strong>{c.name}</Text>
                    <div style={{ marginTop: 4 }}>
                      <Tag>{CONTRACT_TYPE_LABELS[c.contractType]}</Tag>
                      <Text style={{ fontSize: 11 }}>{c.region} | {formatNumber(c.duration)} دوره</Text>
                    </div>
                  </div>
                  <Tag color="processing">جدید</Tag>
                </div>
              </Card>
            )} />
          </>
        )}

        {finalized.length > 0 && (
          <>
            <Title level={5} style={{ marginTop: 16 }}>نهایی شده</Title>
            {finalized.map((c) => (
              <Card key={c.id} size="small" style={{ marginBottom: 6, borderRadius: 8, background: '#f6ffed' }}>
                <Text strong>{c.name}</Text>
                <Tag color="success" style={{ float: 'left' }}>نهایی</Tag>
              </Card>
            ))}
          </>
        )}

        {needCollateral.length === 0 && sent.length === 0 && finalized.length === 0 && (
          <Empty description="نوتیف جدیدی ندارید" />
        )}
      </div>
    </>
  );
}
