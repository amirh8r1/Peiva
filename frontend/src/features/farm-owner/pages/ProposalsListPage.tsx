import { useNavigate } from 'react-router-dom';
import { Card, Tag, Typography, Button, Empty, List, theme } from 'antd';
import { useData } from '@/context/DataContext';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageFrame } from '@/components/ui/PageFrame';
import { CardGrid } from '@/components/ui/CardGrid';
import { formatNumber } from '@/utils/format';
import { CONTRACT_TYPE_LABELS } from '@/types';
import { useIsDesktop } from '@/hooks/useResponsive';

const { Text, Title } = Typography;

export function ProposalsListPage() {
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();
  const { token } = theme.useToken();
  const { data } = useData();
  const finIds = new Set(data.contracts.filter((c) => c.status === 'finalized').map((c) => c.id));
  const needCollateral = data.proposals.filter((p) => p.status === 'accepted' && !finIds.has(p.contractId));
  const sent = data.contracts.filter((c) => c.status === 'sent' && !finIds.has(c.id));
  const finalized = data.contracts.filter((c) => c.status === 'finalized');

  return (
    <PageFrame header={<PageHeader title="قراردادهای پیشنهادی" />}>
      {needCollateral.length > 0 && (
        <>
          <Title level={5}>در انتظار تأمین تضامین</Title>
          <CardGrid minWidth={360} gap={16}>
            {needCollateral.map((p) => (
              <Card key={p.id} style={{ background: token.colorWarningBg, border: `1px solid ${token.colorWarning}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  <Text strong>{p.contractName}</Text>
                  <Tag color="warning">تأیید شده</Tag>
                </div>
                <Button type="primary" size="small" block style={{ marginTop: 8 }}
                  onClick={() => navigate(`/farm/collateral/${p.contractId}`)}>تأمین تضامین</Button>
              </Card>
            ))}
          </CardGrid>
        </>
      )}

      {sent.length > 0 && (
        <>
          <Title level={5} style={{ marginTop: 12 }}>قراردادهای ارسال شده</Title>
          <List dataSource={sent} grid={{ gutter: [12, isDesktop ? 12 : 8], xs: 1, md: 2, xl: 3 }} renderItem={(c) => (
            <Card hoverable size="small" onClick={() => navigate(`/farm/proposals/${c.id}`)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <div style={{ minWidth: 0 }}>
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
          <Title level={5} style={{ marginTop: 12 }}>نهایی شده</Title>
          <CardGrid minWidth={360} gap={16} mobileSpacing={6}>
            {finalized.map((c) => (
              <Card key={c.id} size="small" style={{ background: token.colorSuccessBg }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  <Text strong>{c.name}</Text>
                  <Tag color="success">نهایی</Tag>
                </div>
              </Card>
            ))}
          </CardGrid>
        </>
      )}

      {needCollateral.length === 0 && sent.length === 0 && finalized.length === 0 && (
        <Empty description="نوتیف جدیدی ندارید" />
      )}
    </PageFrame>
  );
}
