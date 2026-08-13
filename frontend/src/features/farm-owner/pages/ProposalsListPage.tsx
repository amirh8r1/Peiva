import { useNavigate } from 'react-router-dom';
import { Card, Tag, Typography, Button, Empty, List } from 'antd';
import { useData } from '@/context/DataContext';
import { PageHeader } from '@/components/ui/PageHeader';
import { formatNumber } from '@/utils/format';
import { CONTRACT_TYPE_LABELS } from '@/types';
import { useIsDesktop } from '@/hooks/useResponsive';
import { responsiveGrid } from '@/utils/responsive';

const { Text, Title } = Typography;

export function ProposalsListPage() {
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();
  const { data } = useData();
  const finIds = new Set(data.contracts.filter((c) => c.status === 'finalized').map((c) => c.id));
  const needCollateral = data.proposals.filter((p) => p.status === 'accepted' && !finIds.has(p.contractId));
  const sent = data.contracts.filter((c) => c.status === 'sent' && !finIds.has(c.id));
  const finalized = data.contracts.filter((c) => c.status === 'finalized');

  return (
    <>
      <PageHeader title="قراردادهای پیشنهادی" />
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {needCollateral.length > 0 && (
          <>
            <Title level={5}>در انتظار تأمین تضامین</Title>
            <div style={isDesktop ? responsiveGrid(360, 16) : undefined}>
              {needCollateral.map((p) => (
                <Card key={p.id} style={{ marginBottom: isDesktop ? 0 : 10, background: '#fff7e6', borderRadius: 10, border: '1px solid #faad14' }}>
                  <Text strong>{p.contractName}</Text>
                  <Tag color="warning" style={{ float: 'left' }}>تأیید شده</Tag>
                  <Button type="primary" size="small" block style={{ marginTop: 8 }}
                    onClick={() => navigate(`/farm/collateral/${p.contractId}`)}>تأمین تضامین</Button>
                </Card>
              ))}
            </div>
          </>
        )}

        {sent.length > 0 && (
          <>
            <Title level={5} style={{ marginTop: 16 }}>قراردادهای ارسال شده</Title>
            <List dataSource={sent} grid={{ gutter: [12, isDesktop ? 12 : 6], xs: 1, md: 2, xl: 3 }} renderItem={(c) => (
              <Card hoverable size="small" style={{ borderRadius: 8 }} onClick={() => navigate(`/farm/proposals/${c.id}`)}>
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
            <div style={isDesktop ? responsiveGrid(360, 16) : undefined}>
              {finalized.map((c) => (
                <Card key={c.id} size="small" style={{ marginBottom: isDesktop ? 0 : 6, borderRadius: 8, background: '#f6ffed' }}>
                  <Text strong>{c.name}</Text>
                  <Tag color="success" style={{ float: 'left' }}>نهایی</Tag>
                </Card>
              ))}
            </div>
          </>
        )}

        {needCollateral.length === 0 && sent.length === 0 && finalized.length === 0 && (
          <Empty description="نوتیف جدیدی ندارید" />
        )}
      </div>
    </>
  );
}
